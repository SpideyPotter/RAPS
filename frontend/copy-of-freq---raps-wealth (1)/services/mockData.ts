import { Fund, NavPoint, SipReportRow, SipSummary, RiskLevel, DashboardData, ForecastPoint, VolatilityPoint, HeatmapItem, RiskDecomp, SectorExposureItem } from '../types';

export const MOCK_FUNDS: Fund[] = [
  { 
    id: '1', 
    name: 'RAPS Bluechip Equity Fund', 
    category: 'Large Cap', 
    amc: 'RAPS Capital', 
    nav: 145.23, 
    cagr1y: 15.4, 
    cagr3y: 12.8, 
    risk: 'Moderately High',
    expenseRatio: 0.75,
    stdDev: 14.2,
    sharpeRatio: 1.1,
    alpha: 2.5,
    exitLoad: '1% if redeemed within 1 year',
    aum: '15,420.50',
    nature: 'Open Ended',
    benchmark: 'NIFTY 50 TRI',
    inceptionDate: '01-01-2015',
    age: '9.2 Years',
    minLumpsum: 5000,
    minSip: 500,
    options: 'Growth/Dividend',
    entryLoad: 'Nil',
    fundManager: 'Mr. Rajesh Gupta',
    managerEducation: 'B.Tech, MBA (Finance)',
    managerExperience: 'May 2012 - Present',
    managerSchemesCount: 'Managing 3 schemes',
    assetAllocation: { equity: 98.5, debt: 0, others: 1.5 },
    holdings: [
      { name: 'HDFC Bank Ltd.', sector: 'Financial Services', asset: 9.5, cumulative: 9.5 },
      { name: 'Reliance Industries Ltd.', sector: 'Energy', asset: 8.2, cumulative: 17.7 },
      { name: 'ICICI Bank Ltd.', sector: 'Financial Services', asset: 7.1, cumulative: 24.8 },
      { name: 'Infosys Ltd.', sector: 'Technology', asset: 5.8, cumulative: 30.6 },
      { name: 'Larsen & Toubro Ltd.', sector: 'Construction', asset: 4.5, cumulative: 35.1 }
    ],
    sectors: [
      { name: 'Financial Services', asset: 32.5 },
      { name: 'Technology', asset: 14.2 },
      { name: 'Energy', asset: 11.8 },
      { name: 'Consumer Goods', asset: 9.5 }
    ],
    lumpsumPerf: [
      { period: '1 Year', amount: 11540, scheme: 15.4, benchmark: 12.1 },
      { period: '3 Year', amount: 14350, scheme: 12.8, benchmark: 11.5 },
      { period: '5 Year', amount: 19500, scheme: 14.2, benchmark: 13.1 },
      { period: 'Since Inception', amount: 38000, scheme: 13.5, benchmark: 12.2 }
    ],
    sipPerf: [
      { period: '1 Year', amount: 120000, scheme: 18.2, benchmark: 14.5 },
      { period: '3 Year', amount: 360000, scheme: 42.5, benchmark: 38.1 },
      { period: '5 Year', amount: 600000, scheme: 75.2, benchmark: 68.4 }
    ]
  },
  { 
    id: '2', 
    name: 'RAPS Midcap Opportunities', 
    category: 'Mid Cap', 
    amc: 'RAPS Capital', 
    nav: 89.45, 
    cagr1y: 22.1, 
    cagr3y: 18.5, 
    risk: RiskLevel.High,
    expenseRatio: 0.85,
    stdDev: 18.5,
    sharpeRatio: 0.9,
    alpha: 3.8,
    exitLoad: '1% if redeemed within 1 year',
    aum: '8,240.10',
    nature: 'Open Ended',
    benchmark: 'NIFTY Midcap 150 TRI',
    inceptionDate: '15-03-2017',
    age: '7.5 Years',
    minLumpsum: 5000,
    minSip: 1000,
    options: 'Growth',
    entryLoad: 'Nil',
    fundManager: 'Ms. Priya Sharma',
    managerEducation: 'B.Com, CA',
    managerExperience: 'Aug 2015 - Present',
    managerSchemesCount: 'Managing 5 schemes',
    assetAllocation: { equity: 96.2, debt: 0, others: 3.8 },
    holdings: [
      { name: 'Trent Ltd.', sector: 'Consumer Services', asset: 4.5, cumulative: 4.5 },
      { name: 'TVS Motor Company', sector: 'Automobile', asset: 3.8, cumulative: 8.3 },
      { name: 'Indian Hotels Co.', sector: 'Consumer Services', asset: 3.5, cumulative: 11.8 },
      { name: 'Federal Bank', sector: 'Financial Services', asset: 3.2, cumulative: 15.0 },
      { name: 'Bharat Forge', sector: 'Capital Goods', asset: 3.0, cumulative: 18.0 }
    ],
    sectors: [
      { name: 'Automobile', asset: 18.5 },
      { name: 'Financial Services', asset: 16.2 },
      { name: 'Capital Goods', asset: 14.8 },
      { name: 'Consumer Services', asset: 12.5 }
    ],
    lumpsumPerf: [
      { period: '1 Year', amount: 12210, scheme: 22.1, benchmark: 19.5 },
      { period: '3 Year', amount: 16500, scheme: 18.5, benchmark: 16.2 },
      { period: '5 Year', amount: 24000, scheme: 19.8, benchmark: 17.5 },
      { period: 'Since Inception', amount: 42000, scheme: 20.5, benchmark: 18.1 }
    ],
    sipPerf: [
      { period: '1 Year', amount: 120000, scheme: 24.5, benchmark: 21.2 },
      { period: '3 Year', amount: 360000, scheme: 55.2, benchmark: 48.5 },
      { period: '5 Year', amount: 600000, scheme: 92.1, benchmark: 84.2 }
    ]
  },
  { 
    id: '3', 
    name: 'RAPS Flexi Cap Saver', 
    category: 'Flexi Cap', 
    amc: 'RAPS Capital', 
    nav: 210.11, 
    cagr1y: 14.2,
    cagr3y: 15.1, 
    risk: RiskLevel.VeryHigh,
    expenseRatio: 0.95,
    stdDev: 16.2,
    sharpeRatio: 0.8,
    alpha: 1.5,
    exitLoad: '1% if redeemed within 1 year',
    aum: '6,500.00',
    nature: 'Open Ended',
    benchmark: 'NIFTY 500 TRI',
    inceptionDate: '10-06-2016',
    age: '8.2 Years',
    minLumpsum: 1000,
    minSip: 500,
    options: 'Growth',
    entryLoad: 'Nil',
    fundManager: 'Mr. Amit Patel',
    managerEducation: 'M.Sc Finance',
    managerExperience: 'Jan 2010 - Present',
    managerSchemesCount: 'Managing 2 schemes',
    assetAllocation: { equity: 92.5, debt: 5.0, others: 2.5 },
    holdings: [
      { name: 'Bajaj Finance', sector: 'Financial Services', asset: 5.5, cumulative: 5.5 },
      { name: 'Asian Paints', sector: 'Consumer Goods', asset: 4.8, cumulative: 10.3 }
    ],
    sectors: [
      { name: 'Financial Services', asset: 28.5 },
      { name: 'Consumer Goods', asset: 18.2 }
    ],
    lumpsumPerf: [
      { period: '1 Year', amount: 11420, scheme: 14.2, benchmark: 13.5 },
      { period: '3 Year', amount: 15100, scheme: 15.1, benchmark: 14.2 }
    ],
    sipPerf: [
      { period: '1 Year', amount: 120000, scheme: 16.5, benchmark: 15.1 },
      { period: '3 Year', amount: 360000, scheme: 45.2, benchmark: 40.5 }
    ]
  }
];

export const generateNavHistory = (currentNav: number, days: number): NavPoint[] => {
  const data: NavPoint[] = [];
  let nav = currentNav;
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.unshift({
        date: date.toISOString().split('T')[0],
        nav: Number(nav.toFixed(2))
    });
    const dailyReturn = 0.0005 + (Math.random() * 0.02 - 0.01); 
    nav = nav / (1 + dailyReturn);
  }
  return data;
};

export const calculateSipReport = (
  fundId: string,
  fromDateStr: string,
  toDateStr: string,
  sipDay: number,
  amount: number,
  enableTopUp: boolean,
  topUpAmount: number,
  topUpFreq: string
): { summary: SipSummary; details: SipReportRow[] } => {
  
  const fund = MOCK_FUNDS.find(f => f.id === fundId) || MOCK_FUNDS[0];
  
  const fromDate = new Date(fromDateStr);
  const toDate = new Date(toDateStr);
  const rows: SipReportRow[] = [];
  
  let currentDate = new Date(fromDate);
  if (currentDate.getDate() > sipDay) {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  currentDate.setDate(sipDay);

  let totalAmount = 0;
  let totalUnits = 0;
  
  let topUpTotalAmount = 0;
  let topUpTotalUnits = 0;
  let currentSipAmount = amount;
  
  let srNo = 1;
  
  let currentNav = fund.nav * 0.7; 
  const monthsDiff = Math.max(1, (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24 * 30));
  const monthlyGrowth = Math.pow(fund.nav / currentNav, 1/monthsDiff);

  while (currentDate <= toDate) {
    currentNav = currentNav * monthlyGrowth * (1 + (Math.random() * 0.04 - 0.02));
    
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const units = amount / currentNav;
    totalAmount += amount;
    totalUnits += units;
    const currentValue = totalUnits * currentNav;

    let topUpUnits = 0;
    let topUpCurrentValue = 0;
    
    if (enableTopUp) {
      if (srNo > 1) {
          if (topUpFreq === 'Yearly' && (srNo - 1) % 12 === 0) {
              currentSipAmount += topUpAmount;
          } else if (topUpFreq === 'Half Yearly' && (srNo - 1) % 6 === 0) {
              currentSipAmount += topUpAmount;
          }
      } else {
          currentSipAmount = amount; 
      }

      topUpUnits = currentSipAmount / currentNav;
      topUpTotalAmount += currentSipAmount;
      topUpTotalUnits += topUpUnits;
      topUpCurrentValue = topUpTotalUnits * currentNav;
    }

    rows.push({
      srNo,
      date: dateStr,
      nav: currentNav,
      sipAmount: amount,
      units,
      cumulativeUnits: totalUnits,
      currentValue,
      topUpSipAmount: enableTopUp ? currentSipAmount : 0,
      topUpUnits: enableTopUp ? topUpUnits : 0,
      topUpCumulativeUnits: enableTopUp ? topUpTotalUnits : 0,
      topUpCurrentValue: enableTopUp ? topUpCurrentValue : 0
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
    srNo++;
  }

  const lastRow = rows[rows.length - 1] || { currentValue: 0, topUpCurrentValue: 0 };
  
  const summary: SipSummary = {
    installments: rows.length,
    totalAmount,
    totalUnits: Number(totalUnits.toFixed(4)),
    currentValue: Math.round(lastRow.currentValue),
    profit: Math.round(lastRow.currentValue - totalAmount),
    returns: totalAmount > 0 ? Number(((lastRow.currentValue - totalAmount) / totalAmount * 100).toFixed(2)) : 0,
    topUpTotalAmount,
    topUpTotalUnits: Number(topUpTotalUnits.toFixed(4)),
    topUpCurrentValue: Math.round(lastRow.topUpCurrentValue),
    topUpProfit: Math.round(lastRow.topUpCurrentValue - topUpTotalAmount),
    topUpReturns: topUpTotalAmount > 0 ? Number(((lastRow.topUpCurrentValue - topUpTotalAmount) / topUpTotalAmount * 100).toFixed(2)) : 0,
  };

  return { summary, details: rows };
};

// --- HELPER FOR RAPS DASHBOARD ---
export const generateDashboardData = (basketIds: string[], horizon: number): DashboardData => {
  // 1. NAV Forecast (ARIMA/LSTM simulation)
  const historyPoints = 90;
  const forecastData: ForecastPoint[] = [];
  const today = new Date();
  let lastVal = 100;
  
  // History
  for (let i = historyPoints; i > 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    lastVal = lastVal * (1 + (Math.random() * 0.02 - 0.008)); // Trend
    forecastData.push({
      date: d.toISOString().split('T')[0],
      historical: Number(lastVal.toFixed(2))
    });
  }
  
  // Forecast
  let arimaVal = lastVal;
  let lstmVal = lastVal;
  let ciWidth = 2;
  
  for (let i = 1; i <= horizon; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    
    // ARIMA (Smoother, mean reverting)
    arimaVal = arimaVal * (1.0005 + (Math.random() * 0.005 - 0.0025));
    
    // LSTM (More volatile, trend following)
    lstmVal = lstmVal * (1.0008 + (Math.random() * 0.01 - 0.004));
    
    ciWidth += 0.15; // CI widens over time

    forecastData.push({
      date: d.toISOString().split('T')[0],
      arima: Number(arimaVal.toFixed(2)),
      lstm: Number(lstmVal.toFixed(2)),
      upperCI: Number((arimaVal + ciWidth).toFixed(2)),
      lowerCI: Number((arimaVal - ciWidth).toFixed(2))
    });
  }

  // 2. Volatility (GARCH simulation)
  const volData: VolatilityPoint[] = [];
  let vol = 12;
  // Past
  for (let i = 60; i > 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    vol = vol * 0.9 + 15 * 0.1 + (Math.random() * 4 - 2);
    volData.push({ date: d.toISOString().split('T')[0], realized: Number(Math.max(5, vol).toFixed(2)) });
  }
  // Future GARCH
  let garch = vol;
  for (let i = 1; i <= horizon; i++) {
     const d = new Date(today);
     d.setDate(d.getDate() + i);
     garch = garch * 0.95 + 14 * 0.05; // Mean reverting to 14
     volData.push({ date: d.toISOString().split('T')[0], realized: 0, garchForecast: Number(garch.toFixed(2)) });
  }

  // 3. Heatmap
  const funds = basketIds.map(id => MOCK_FUNDS.find(f => f.id === id)?.name || 'Unknown');
  const matrix: HeatmapItem[] = [];
  funds.forEach((f1, i) => {
     funds.forEach((f2, j) => {
        let val = 0;
        if (i === j) val = 1;
        else val = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)); // Random 0.1 to 0.9
        matrix.push({ x: f1.split(' ')[1] || f1.substring(0,4), y: f2.split(' ')[1] || f2.substring(0,4), value: val });
     });
  });

  // 4. Rolling Correlation
  const rollingData = [];
  for(let i=30; i>0; i--) {
     const d = new Date(today);
     d.setDate(d.getDate() - i * 5);
     const pt: any = { date: d.toISOString().split('T')[0].slice(5) };
     funds.forEach(f => {
        pt[f.split(' ')[1] || 'Fund'] = parseFloat((Math.random() * 0.4 + 0.5).toFixed(2));
     });
     rollingData.push(pt);
  }

  // 5. Risk Decomp
  const risk: RiskDecomp[] = funds.map(f => ({
     name: f,
     weight: Number((100/funds.length).toFixed(0)),
     contribution: Number((Math.random() * 30 + 10).toFixed(1))
  }));

  // 6. Sector Exposure (Aggregation)
  // Aggregate sector assets from all selected funds
  const sectorMap = new Map<string, number>();
  let totalAsset = 0;
  
  basketIds.forEach(id => {
    const fund = MOCK_FUNDS.find(f => f.id === id);
    if (fund) {
      fund.sectors.forEach(s => {
        const current = sectorMap.get(s.name) || 0;
        sectorMap.set(s.name, current + s.asset);
        totalAsset += s.asset;
      });
    }
  });

  const sectorExposure: SectorExposureItem[] = [];
  sectorMap.forEach((value, key) => {
    // Normalize to mimic average exposure in portfolio
    const avgValue = value / basketIds.length;
    sectorExposure.push({ name: key, value: parseFloat(avgValue.toFixed(1)) });
  });
  
  // Sort by value desc
  sectorExposure.sort((a, b) => b.value - a.value);


  return {
     navForecast: forecastData,
     volatility: volData,
     correlationMatrix: matrix,
     rollingCorrelation: rollingData,
     riskDecomposition: risk,
     sectorExposure: sectorExposure,
     kpis: {
        expectedReturn: 13.4,
        expectedVol: 11.2,
        sharpe: 1.25,
        diversificationScore: 0.72,
        var95: 4.5
     }
  };
};