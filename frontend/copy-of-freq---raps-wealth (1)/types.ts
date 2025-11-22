export interface Fund {
  id: string;
  name: string;
  category: string;
  amc: string;
  nav: number;
  cagr1y: number;
  cagr3y: number;
  risk: 'Low' | 'Moderately Low' | 'Moderate' | 'Moderately High' | 'High' | 'Very High';
  expenseRatio: number;
  stdDev: number;
  sharpeRatio: number;
  alpha: number;
  exitLoad: string;
  // New fields for Detailed PDF View
  aum: string;
  nature: string;
  benchmark: string;
  inceptionDate: string;
  age: string;
  minLumpsum: number;
  minSip: number;
  options: string; // e.g. Growth/Dividend
  entryLoad: string;
  fundManager: string;
  // New Manager Fields
  managerEducation: string;
  managerExperience: string;
  managerSchemesCount: string;
  
  holdings: { name: string; sector: string; asset: number; cumulative: number }[];
  sectors: { name: string; asset: number }[];
  
  // New Asset Allocation
  assetAllocation: { equity: number; debt: number; others: number };

  lumpsumPerf: { period: string; amount: number; scheme: number; benchmark: number }[];
  sipPerf: { period: string; amount: number; scheme: number; benchmark: number }[];
}

export interface NavPoint {
  date: string;
  nav: number;
}

export interface SipPoint {
  date: string;
  invested: number;
  value: number;
}

export enum RiskLevel {
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High',
  VeryHigh = 'Very High'
}

// New types for Detailed SIP Report
export interface SipReportRow {
  srNo: number;
  date: string;
  nav: number;
  // Normal SIP
  sipAmount: number;
  units: number;
  cumulativeUnits: number;
  currentValue: number;
  // Top Up SIP
  topUpSipAmount: number;
  topUpUnits: number;
  topUpCumulativeUnits: number;
  topUpCurrentValue: number;
}

export interface SipSummary {
  installments: number;
  totalAmount: number;
  totalUnits: number;
  currentValue: number;
  profit: number;
  returns: number; // Percentage
  // Top Up
  topUpTotalAmount: number;
  topUpTotalUnits: number;
  topUpCurrentValue: number;
  topUpProfit: number;
  topUpReturns: number;
}

// --- RAPS Calculator Analytics Types ---

export interface ForecastPoint {
  date: string;
  historical?: number;
  arima?: number;
  lstm?: number;
  upperCI?: number;
  lowerCI?: number;
}

export interface VolatilityPoint {
  date: string;
  realized: number;
  garchForecast?: number;
}

export interface HeatmapItem {
  x: string;
  y: string;
  value: number; // Correlation -1 to 1
}

export interface RiskDecomp {
  name: string;
  contribution: number; // % contribution to VaR
  weight: number;
}

export interface SectorExposureItem {
  name: string;
  value: number;
}

export interface DashboardData {
  navForecast: ForecastPoint[];
  volatility: VolatilityPoint[];
  correlationMatrix: HeatmapItem[];
  rollingCorrelation: { date: string; [key: string]: number | string }[];
  riskDecomposition: RiskDecomp[];
  sectorExposure: SectorExposureItem[];
  kpis: {
    expectedReturn: number;
    expectedVol: number;
    sharpe: number;
    diversificationScore: number;
    var95: number;
  };
}