import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.chrome.options import Options
import os


# --- CONFIGURATION ---
COOKIE_CLOSE_SELECTOR = "ant-modal-close-x"
SEARCH_INPUT_SELECTOR = "//input[@placeholder='Search by Scheme Name']"
# ---------------------

# --- HELPER FUNCTIONS ---

def scrape_progress_section(driver, header_text):
    """Scrape progress bar sections like Top Holdings, Sector Holdings, etc."""
    data = {}
    try:
        headers = driver.find_elements(By.XPATH, f"//div[contains(@class, 'ant-collapse-header') and contains(., '{header_text}')]")
        for header in headers:
            try:
                items = header.find_elements(By.XPATH, "./following-sibling::div//ul/li")
                if len(items) > 0:
                    for item in items:
                        try:
                            name = item.find_element(By.TAG_NAME, "small").text
                            val = item.find_element(By.CLASS_NAME, "ant-progress-text").text
                            if name and val:
                                data[name.strip()] = val.strip()
                        except: 
                            continue
                    if data:
                        print(f"Successfully scraped '{header_text}' ({len(data)} items)")
                        return data
            except: 
                continue
        if not data:
            print(f"Found headers for '{header_text}' but extracted no data.")
    except Exception as e:
        print(f"Error scraping '{header_text}': {e}")
    return data

def scrape_performance_table(driver, header_text):
    """Scrape performance tables (Lumpsum/SIP)."""
    data = []
    try:
        table_xpath = f"//div[contains(@class, 'ant-collapse-header') and contains(., '{header_text}')]/following-sibling::div//table"
        WebDriverWait(driver, 2).until(EC.presence_of_element_located((By.XPATH, table_xpath)))
        table = driver.find_element(By.XPATH, table_xpath)
        headers = [th.text.strip() for th in table.find_elements(By.TAG_NAME, "th")]
        rows = table.find_elements(By.XPATH, ".//tbody/tr")
        for tr in rows:
            cells = tr.find_elements(By.TAG_NAME, "td")
            if len(cells) == len(headers):
                row_dict = {headers[i]: cells[i].text.strip() for i in range(len(cells))}
                data.append(row_dict)
        print(f"Successfully scraped '{header_text}'")
    except:
        print(f"Table not found or timed out: '{header_text}'")
    return data

# -------------------------

def scrape_fund_data(search_term, save_to_file=True, headless=True, debug=False):
    """
    Main scraping function to be used with Flask.
    
    Args:
        search_term (str): The search term to enter (e.g., "Axis Aggressive Hybrid")
        save_to_file (bool): Whether to save the data to a JSON file
        output_filename (str): The filename for the JSON output
        headless (bool): Run Chrome in headless mode (recommended for production)
        debug (bool): Enable debug mode with screenshots
    
    Returns:
        dict: The scraped fund data containing fund information and the selected fund name
        
    Raises:
        Exception: If scraping fails
    """
    
    # Setup Chrome options
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.maximize_window()
    print(f"Scraper started for: {search_term}")

    try:
        # 1. Navigate and Search
        print("Opening website...")
        driver.get("https://www.njwealth.in/")
        original_window = driver.current_window_handle

        try:
            WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.CLASS_NAME, COOKIE_CLOSE_SELECTOR))).click()
            print("Cookie banner closed.")
            time.sleep(1)
        except:
            print("No cookie banner found or could not close.")

        print(f"Searching for '{search_term}'...")
        search_box = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, SEARCH_INPUT_SELECTOR)))
        search_box.clear()
        time.sleep(0.5)
        
        # Type character by character to trigger dropdown
        for char in search_term:
            search_box.send_keys(char)
            time.sleep(0.1)
        
        print("Waiting for dropdown results...")
        time.sleep(2)  # Wait for dropdown to fully render
        
        if debug:
            driver.save_screenshot('debug_after_search.png')
            print("Debug: Saved screenshot 'debug_after_search.png'")
        
        # Wait for the specific dropdown container
        print("Looking for dropdown container...")
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "header_dropdown__29rBL"))
            )
            print("✓ Dropdown container found!")
        except TimeoutException:
            print("✗ Dropdown container not found")
            if debug:
                driver.save_screenshot('debug_no_dropdown.png')
                with open('debug_page_source.html', 'w', encoding='utf-8') as f:
                    f.write(driver.page_source)
            raise Exception("Dropdown did not appear. Check if search term returns results.")
        
        # Find the first dropdown item
        print("Looking for first dropdown item...")
        try:
            # Wait for dropdown items to be present
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "header_dropdownRow__3NCLn"))
            )
            
            # Get the first item
            first_item = driver.find_element(By.XPATH, "//li[@class='header_dropdownRow__3NCLn'][1]//h5")
            first_item_text = first_item.text.strip()
            
            if not first_item_text:
                raise Exception("First dropdown item has no text")
            
            print(f"✓ First dropdown item found: '{first_item_text}'")
            
        except Exception as e:
            print(f"✗ Failed to find dropdown item: {e}")
            if debug:
                driver.save_screenshot('debug_item_not_found.png')
                with open('debug_page_source.html', 'w', encoding='utf-8') as f:
                    f.write(driver.page_source)
            raise Exception(f"Could not find dropdown items: {e}")
        
        print("Clicking first dropdown item...")
        
        # Scroll into view and click
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_item)
        time.sleep(0.5)
        
        try:
            # Try regular click first
            first_item.click()
            print("  ✓ Clicked using regular click")
        except Exception as e:
            print(f"  Regular click failed, trying JavaScript click...")
            driver.execute_script("arguments[0].click();", first_item)
            print("  ✓ Clicked using JavaScript")
        
        time.sleep(1)
        
        # Switch Tab
        WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(2))
        for window_handle in driver.window_handles:
            if window_handle != original_window:
                driver.switch_to.window(window_handle)
                break
                
        print(f"Switched to fund page.")
        
        print("Waiting for fund page to lazy-load components...")
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(., 'Scheme Documents')]"))
            )
            time.sleep(2)
        except:
            pass
        print("Page components loaded.")

        # 2. START SCRAPING
        print("Scraping data...")
        final_data = {
            "selected_fund": first_item_text,
            "basic_info": {},
            "scheme_details": {},
            "fund_managers": [],
            "top_holdings": {},
            "sector_holdings": {},
            "asset_allocation": {},
            "top_asset_type": {},
            "credit_profile": {},
            "portfolio_summary": {},
            "portfolio_holdings": { "equity": [], "debt": [], "others": [] },
            "performance_lumpsum": [],
            "performance_sip": [],
            "documents": []
        }

        # A. Basic Info
        try:
            final_data["basic_info"]["fund_name"] = driver.find_element(By.XPATH, "//h2[@class='pull-left']").text
        except: 
            pass
        try:
            final_data["basic_info"]["nav"] = driver.find_element(By.XPATH, "//div[@class='navbox']//strong[@class='text-black']").text
        except: 
            pass
        try:
            aum_element = driver.find_element(By.XPATH, "//div[contains(@class, 'aumamount')]/h2")
            final_data["basic_info"]["aum"] = aum_element.text.split('\n')[0]
        except: 
            pass

        # B. Scheme Details
        try:
            aum_key = driver.find_element(By.XPATH, "//div[contains(@class, 'aumamount')]//small").text.strip()
            aum_val = final_data["basic_info"]["aum"]
            final_data["scheme_details"][aum_key] = aum_val
        except: 
            pass
        try:
            plan_lists = driver.find_elements(By.CLASS_NAME, "planLists")
            for list_ul in plan_lists:
                items = list_ul.find_elements(By.TAG_NAME, "li")
                for item in items:
                    try:
                        label = item.find_element(By.TAG_NAME, "h5").text
                        value = item.find_element(By.TAG_NAME, "p").text
                        if label:
                            final_data["scheme_details"][label.strip()] = value.strip()
                    except: 
                        continue
        except: 
            pass

        # C. Fund Managers
        try:
            managers = driver.find_elements(By.XPATH, "//div[contains(@class, 'fundmanager')]//div[contains(@class, 'mt-3 p-2 ')]")
            for mgr in managers:
                name = mgr.find_element(By.TAG_NAME, "strong").text
                details = mgr.text.replace(name, "").replace("View Details", "").strip().split('\n')
                final_data["fund_managers"].append({
                    "name": name,
                    "tenure": details[0] if len(details) > 0 else "",
                    "managing": details[1] if len(details) > 1 else ""
                })
        except: 
            pass

        # D. Progress Bar Lists
        final_data["top_holdings"] = scrape_progress_section(driver, "Top Holdings")
        final_data["sector_holdings"] = scrape_progress_section(driver, "Top Sector Holdings")
        final_data["asset_allocation"] = scrape_progress_section(driver, "Asset Allocation")
        final_data["top_asset_type"] = scrape_progress_section(driver, "Top Asset Type")
        final_data["credit_profile"] = scrape_progress_section(driver, "Credit Profile")

        # E. Performance Tables
        final_data["performance_lumpsum"] = scrape_performance_table(driver, "Lumpsum Performance")
        final_data["performance_sip"] = scrape_performance_table(driver, "SIP Performance")

        # F. Documents
        try:
            docs = driver.find_elements(By.XPATH, "//div[contains(@class, 'ant-collapse-header') and contains(., 'Scheme Documents')]/following-sibling::div//button")
            for doc in docs:
                final_data["documents"].append(doc.text.strip())
        except: 
            pass

        # G. FULL PORTFOLIO
        print("\nScraping full portfolio section...")
        try:
            main_portfolio_container = driver.find_element(By.XPATH, "//div[contains(@class, 'ant-collapse-header') and contains(., 'Portfolio Details')]/following-sibling::div")
            
            # G1. Portfolio Summary
            try:
                asset_list = main_portfolio_container.find_element(By.CLASS_NAME, "assetdetails")
                items = asset_list.find_elements(By.TAG_NAME, "li")
                for item in items:
                    h4 = item.find_element(By.TAG_NAME, "h4")
                    value = h4.text.strip()
                    key = item.text.replace(value, "").strip()
                    final_data["portfolio_summary"][key] = value
                print("Successfully scraped 'Portfolio Summary'")
            except:
                print("Could not scrape 'Portfolio Summary'")
                
            # G2. Scrape Portfolio Tables (Equity, Debt, Others)
            categories = ["Equity", "Debt", "Others"]
            
            for category in categories:
                print(f"\n--- Scraping category: {category} ---")
                
                try:
                    category_button = main_portfolio_container.find_element(By.XPATH, f".//label[.//span[text()='{category}']]")
                    driver.execute_script("arguments[0].click();", category_button)
                    time.sleep(2)
                except:
                    print(f"Could not find/click button for '{category}'.")
                    continue

                page = 1
                while True:
                    try:
                        table_wrapper = main_portfolio_container.find_element(By.XPATH, ".//div[@class='ant-table-wrapper']")
                        headers = [th.text.strip() for th in table_wrapper.find_elements(By.XPATH, ".//thead/tr/th")]
                        if not headers: 
                            break

                        print(f"Scraping page {page}...")
                        rows = table_wrapper.find_elements(By.XPATH, ".//tbody/tr")
                        
                        if len(rows) == 1 and "no data" in rows[0].text.lower():
                            print(f"No data found for '{category}'.")
                            break

                        for row in rows:
                            cols = row.find_elements(By.TAG_NAME, "td")
                            if len(cols) == len(headers):
                                row_data = {headers[i]: cols[i].text.strip() for i in range(len(headers))}
                                final_data["portfolio_holdings"][category.lower()].append(row_data)
                        
                        next_btn = WebDriverWait(table_wrapper, 1).until(
                            EC.element_to_be_clickable((By.XPATH, ".//li[contains(@class, 'ant-pagination-next') and not(contains(@class, 'ant-pagination-disabled'))]/a"))
                        )
                        driver.execute_script("arguments[0].click();", next_btn)
                        time.sleep(1.5)
                        page += 1
                        main_portfolio_container = driver.find_element(By.XPATH, "//div[contains(@class, 'ant-collapse-header') and contains(., 'Portfolio Details')]/following-sibling::div")
                    
                    except (TimeoutException, NoSuchElementException):
                        print(f"Finished '{category}'.")
                        break
                    except Exception as e:
                        print(f"Pagination error: {e}")
                        break
        except Exception as e:
            print(f"Error in portfolio section: {e}")
            
        # 3. SAVE TO FILE (if requested)

        if save_to_file:
            print("\n" + "="*30)
            output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'Database')
            os.makedirs(output_dir, exist_ok=True)
            output_filename = os.path.join(output_dir, f"{search_term.lower().replace(' ', '_')}.json")
            print(f"SAVING DATA TO {output_filename}")
            print("="*30)

            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(final_data, f, indent=2, ensure_ascii=False)

            print(f"Data successfully saved to '{output_filename}'")

        # Cleanup
        driver.close()
        driver.switch_to.window(original_window)
        time.sleep(1)
        
        return final_data

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        try:
            driver.quit()
            print("Driver closed.")
        except:
            pass


# Example usage and testing
if __name__ == "__main__":
    import sys
    
    # Test Mode: Run scraper directly
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        print("="*50)
        print("RUNNING SCRAPER IN TEST MODE")
        print("="*50)
        
        # Test with different funds
        test_cases = [
            {"search_term": "Axis Aggressive Hybrid Fund - Gr", "output_file": "axis_aggressive_hybrid_fund_gr.json"},
            {"search_term": "Axis Arbitrage Fund - Regular Gr", "output_file": "axis_arbitrage_fund_regular_gr.json"},
            {"search_term": "Axis Balanced Advantage Fund - Gr", "output_file": "axis_balanced_advantage_fund_gr.json"},
            {"search_term": "Axis Banking & PSU Debt Fund - Gr", "output_file": "axis_banking_psu_debt_fund_gr.json"},
        ]
        
        for i, test in enumerate(test_cases, 1):
            print(f"\n{'='*50}")
            print(f"TEST CASE {i}: {test['search_term']}")
            print(f"{'='*50}")
            
            try:
                result = scrape_fund_data(
                    search_term=test['search_term'],
                    save_to_file=True,
                    output_filename=test['output_file'],
                    headless=False,  # Set to True to run without browser window
                    debug=True  # Enable debug mode
                )
                
                print(f"\n✓ Successfully scraped: {result.get('selected_fund', 'Unknown')}")
                print(f"✓ Fund Name: {result['basic_info'].get('fund_name', 'N/A')}")
                print(f"✓ NAV: {result['basic_info'].get('nav', 'N/A')}")
                print(f"✓ AUM: {result['basic_info'].get('aum', 'N/A')}")
                print(f"✓ Data saved to: {test['output_file']}")
                
            except Exception as e:
                print(f"\n✗ Test failed: {str(e)}")
        
        print("\n" + "="*50)
        print("TEST MODE COMPLETED")
        print("="*50)
    
    # Flask Mode: Run web server
    else:
        from flask import Flask, jsonify, request
        
        app = Flask(__name__)
        
        @app.route('/')
        def home():
            return jsonify({
                'message': 'Fund Scraper API',
                'endpoints': {
                    '/scrape-fund': 'POST - Scrape fund data',
                    '/health': 'GET - Health check'
                }
            })
        
        @app.route('/health')
        def health():
            return jsonify({'status': 'healthy'})
        
        @app.route('/scrape-fund', methods=['POST'])
        def scrape_fund():
            """
            Flask endpoint to scrape fund data.
            
            Expected JSON payload:
            {
                "search_term": "Axis Aggressive Hybrid",
                "save_to_file": true,
                "output_filename": "fund_data.json"
            }
            """
            try:
                data = request.get_json()
                
                search_term = data.get('search_term')
                save_to_file = data.get('save_to_file', True)
                output_filename = data.get('output_filename', 'fund_data.json')
                
                if not search_term:
                    return jsonify({
                        'error': 'search_term is required'
                    }), 400
                
                # Run the scraper
                result = scrape_fund_data(
                    search_term=search_term,
                    save_to_file=save_to_file,
                    output_filename=output_filename,
                    headless=True  # Use headless mode in production
                )
                
                return jsonify({
                    'status': 'success',
                    'selected_fund': result.get('selected_fund'),
                    'data': result
                }), 200
                
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': str(e)
                }), 500
        
        print("\n" + "="*50)
        print("STARTING FLASK SERVER")
        print("="*50)
        print("\nEndpoints:")
        print("  - http://localhost:5000/")
        print("  - http://localhost:5000/health")
        print("  - http://localhost:5000/scrape-fund (POST)")
        print("\nTest with curl:")
        print('  curl -X POST http://localhost:5000/scrape-fund \\')
        print('    -H "Content-Type: application/json" \\')
        print('    -d \'{"search_term": "Axis Aggressive Hybrid"}\'')
        print("\nOr run in test mode:")
        print("  python script.py test")
        print("="*50 + "\n")
        
        app.run(debug=True, port=5000)