import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException

# --- CONFIGURATION ---
COOKIE_CLOSE_SELECTOR = "ant-modal-close-x"
SEARCH_INPUT_SELECTOR = "//input[@placeholder='Search by Scheme Name']"
SEARCH_TERM = "Axis Aggressive Hybrid"
DROPDOWN_ITEM_TEXT = "Axis Aggressive Hybrid Fund - Gr" 
# ---------------------

# --- HELPER FUNCTIONS ---

def scrape_progress_section(driver, header_text):
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
                        except: continue
                    if data:
                        print(f"Successfully scraped '{header_text}' ({len(data)} items)")
                        return data
            except: continue
        if not data:
            print(f"Found headers for '{header_text}' but extracted no data.")
    except Exception as e:
        print(f"Error scraping '{header_text}': {e}")
    return data

def scrape_performance_table(driver, header_text):
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

driver = webdriver.Chrome()
driver.maximize_window()
print("Scraper started...")

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

    print(f"Searching for '{SEARCH_TERM}'...")
    search_box = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, SEARCH_INPUT_SELECTOR)))
    search_box.send_keys(SEARCH_TERM)
    
    print(f"Selecting '{DROPDOWN_ITEM_TEXT}'...")
    dropdown_xpath = f"//h5[contains(text(), '{DROPDOWN_ITEM_TEXT}')]"
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, dropdown_xpath))).click()
    
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
    except: pass
    try:
        final_data["basic_info"]["nav"] = driver.find_element(By.XPATH, "//div[@class='navbox']//strong[@class='text-black']").text
    except: pass
    try:
        aum_element = driver.find_element(By.XPATH, "//div[contains(@class, 'aumamount')]/h2")
        final_data["basic_info"]["aum"] = aum_element.text.split('\n')[0]
    except: pass

    # B. Scheme Details
    try:
        aum_key = driver.find_element(By.XPATH, "//div[contains(@class, 'aumamount')]//small").text.strip()
        aum_val = final_data["basic_info"]["aum"]
        final_data["scheme_details"][aum_key] = aum_val
    except: pass
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
                except: continue
    except: pass

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
    except: pass

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
    except: pass

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
                    if not headers: break

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
        
    # 3. OUTPUT
    print("\n" + "="*30)
    print("SAVING DATA TO fund_data.json")
    print("="*30)
    
    # Save to a file
    with open('fund_data.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
        
    print("Data successfully saved to 'fund_data.json'")

    # Cleanup
    driver.close()
    driver.switch_to.window(original_window)
    time.sleep(1)

except Exception as e:
    print(f"An unexpected error occurred: {e}")
finally:
    driver.quit()
    print("Driver closed.")