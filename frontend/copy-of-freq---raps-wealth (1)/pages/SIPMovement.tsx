import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, ChevronRight, Download, RotateCcw, CheckCircle2, Eye, SlidersHorizontal } from 'lucide-react';
import { MOCK_FUNDS, calculateSipReport } from '../services/mockData';
import { SipSummary, SipReportRow } from '../types';

const SIPMovement: React.FC = () => {
  // --- Form State ---
  // Removed schemeType state and tabs
  const [selectedFund, setSelectedFund] = useState(MOCK_FUNDS[0].id);
  const [amount, setAmount] = useState(10000);
  const [fromDate, setFromDate] = useState('2023-01-01');
  const [toDate, setToDate] = useState('2025-10-01');
  const [sipDate, setSipDate] = useState(10);
  
  // Top Up State
  const [enableTopUp, setEnableTopUp] = useState(false);
  const [topUpFreq, setTopUpFreq] = useState('Yearly');
  const [topUpAmount, setTopUpAmount] = useState(1000);

  // --- Result State ---
  const [showResults, setShowResults] = useState(false);
  const [reportData, setReportData] = useState<{summary: SipSummary, details: SipReportRow[]} | null>(null);
  
  // --- View Options ---
  const [viewOptions, setViewOptions] = useState({
    nav: true,
    units: false,
    cumulativeUnits: true,
    currentValue: true
  });

  const handleCalculate = () => {
    const result = calculateSipReport(
      selectedFund,
      fromDate,
      toDate,
      sipDate,
      amount,
      enableTopUp,
      topUpAmount,
      topUpFreq
    );
    setReportData(result);
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setReportData(null);
    setAmount(10000);
    setEnableTopUp(false);
  };

  const toggleViewOption = (key: keyof typeof viewOptions) => {
    setViewOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fundName = MOCK_FUNDS.find(f => f.id === selectedFund)?.name || '';

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-8 uppercase tracking-wide">SIP NAV Movement</h1>

        {/* --- SECTION 1: INPUT FORM --- */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-8">
          {/* Removed Tabs Section */}

          <div className="p-6 lg:p-10 space-y-8">
            
            {/* Row 1: Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Scheme Sub Type</label>
                 <div className="relative">
                    <select className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 bg-slate-50 appearance-none focus:ring-2 focus:ring-secondary/30 outline-none">
                       <option>All Sub Types</option>
                       <option>Large Cap</option>
                       <option>Mid Cap</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                       <ChevronRight size={16} className="rotate-90" />
                    </div>
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">AMC</label>
                 <div className="relative">
                    <select className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 bg-slate-50 appearance-none focus:ring-2 focus:ring-secondary/30 outline-none">
                       <option>RAPS Capital</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                       <ChevronRight size={16} className="rotate-90" />
                    </div>
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Scheme Name</label>
                 <div className="relative">
                    <select 
                      value={selectedFund} 
                      onChange={(e) => setSelectedFund(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 bg-slate-50 appearance-none focus:ring-2 focus:ring-secondary/30 outline-none"
                    >
                       {MOCK_FUNDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                       <ChevronRight size={16} className="rotate-90" />
                    </div>
                 </div>
               </div>
            </div>

            {/* Row 2: Amount & Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹)</label>
                 <input 
                   type="number" 
                   value={amount}
                   onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                   className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-secondary/30 outline-none" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Custom Period</label>
                 <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-secondary/30 outline-none" 
                    />
                    <span className="self-center text-slate-400">to</span>
                    <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-secondary/30 outline-none" 
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">SIP Date</label>
                 <div className="relative">
                    <select 
                      value={sipDate} 
                      onChange={(e) => setSipDate(parseInt(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 bg-slate-50 appearance-none focus:ring-2 focus:ring-secondary/30 outline-none"
                    >
                       {[1, 5, 10, 15, 20, 25, 28].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                       <ChevronRight size={16} className="rotate-90" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Row 3: Top Up */}
            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
               <label className="flex items-center gap-3 cursor-pointer mb-6">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${enableTopUp ? 'bg-secondary border-secondary text-white' : 'bg-white border-slate-300'}`}>
                     {enableTopUp && <CheckCircle2 size={14} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={enableTopUp} onChange={() => setEnableTopUp(!enableTopUp)} />
                  <span className="font-bold text-slate-700">Compare your SIP with Top Up SIP</span>
               </label>

               {enableTopUp && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Top Up Frequency</label>
                       <select 
                          value={topUpFreq} 
                          onChange={(e) => setTopUpFreq(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 bg-white focus:ring-2 focus:ring-secondary/30 outline-none"
                       >
                          <option>Yearly</option>
                          <option>Half Yearly</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Top Up Amount (₹)</label>
                       <input 
                         type="number" 
                         value={topUpAmount} 
                         onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)}
                         className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-bold bg-white focus:ring-2 focus:ring-secondary/30 outline-none"
                       />
                    </div>
                 </div>
               )}
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={handleCalculate}
                className="px-12 py-4 bg-secondary hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
              >
                SUBMIT
              </button>
              <button 
                onClick={handleReset}
                className="px-12 py-4 bg-white border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 justify-center"
              >
                <RotateCcw size={18} /> RESET
              </button>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: REPORTS --- */}
        {showResults && reportData && (
          <div className="space-y-8 animate-slide-up">
            
            {/* Summary Header */}
            <div className="bg-slate-800 text-white px-6 py-4 rounded-t-xl flex flex-col md:flex-row justify-between items-center text-sm">
              <div>
                <span className="opacity-70 block md:inline mb-1 md:mb-0 md:mr-4">Date: <span className="font-bold text-white">{fromDate} To {toDate}</span></span>
                <span className="opacity-70 block md:inline">SIP Day: <span className="font-bold text-white">{sipDate}</span></span>
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                 <span className="bg-white/10 px-3 py-1 rounded">{fundName}</span>
              </div>
            </div>

            {/* Summary Report Table */}
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
              <h3 className="p-6 font-bold text-lg text-slate-800 border-b border-slate-100">SIP Summary Reports</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Details</th>
                      <th className="px-6 py-4 text-right text-blue-600">Normal SIP</th>
                      {enableTopUp && <th className="px-6 py-4 text-right text-purple-600">Top Up SIP</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-600">No. of Installments</td>
                      <td className="px-6 py-4 text-right font-bold">{reportData.summary.installments}</td>
                      {enableTopUp && <td className="px-6 py-4 text-right font-bold">{reportData.summary.installments}</td>}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-600">Amount Invested (₹)</td>
                      <td className="px-6 py-4 text-right font-bold">{reportData.summary.totalAmount.toLocaleString()}</td>
                      {enableTopUp && <td className="px-6 py-4 text-right font-bold">{reportData.summary.topUpTotalAmount.toLocaleString()}</td>}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-600">Total Units</td>
                      <td className="px-6 py-4 text-right font-bold">{reportData.summary.totalUnits}</td>
                      {enableTopUp && <td className="px-6 py-4 text-right font-bold">{reportData.summary.topUpTotalUnits}</td>}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-600">Current Value (₹)</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">{reportData.summary.currentValue.toLocaleString()}</td>
                      {enableTopUp && <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">{reportData.summary.topUpCurrentValue.toLocaleString()}</td>}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-600">Return (%)</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">{reportData.summary.returns}%</td>
                      {enableTopUp && <td className="px-6 py-4 text-right font-bold text-green-600">{reportData.summary.topUpReturns}%</td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-lg text-slate-800 mb-6">Growth Visualization</h3>
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.details}>
                      <defs>
                        <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTopUp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tickFormatter={(d) => d.slice(6)} stroke="#94a3b8" fontSize={12} />
                      <YAxis tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="currentValue" 
                        name="Normal SIP Value" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorNormal)" 
                      />
                      {enableTopUp && (
                        <Area 
                          type="monotone" 
                          dataKey="topUpCurrentValue" 
                          name="Top Up SIP Value" 
                          stroke="#a855f7" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#colorTopUp)" 
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Detailed Report */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4">
                  <h3 className="font-bold text-lg text-slate-800">SIP Movement Report</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-bold text-slate-500 uppercase text-xs flex items-center gap-2"><Eye size={14} /> View:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={viewOptions.nav} onChange={() => toggleViewOption('nav')} className="rounded text-secondary focus:ring-secondary" />
                      NAV (₹)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={viewOptions.units} onChange={() => toggleViewOption('units')} className="rounded text-secondary focus:ring-secondary" />
                      Units
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={viewOptions.cumulativeUnits} onChange={() => toggleViewOption('cumulativeUnits')} className="rounded text-secondary focus:ring-secondary" />
                      Cumulative Units
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={viewOptions.currentValue} onChange={() => toggleViewOption('currentValue')} className="rounded text-secondary focus:ring-secondary" />
                      Current Value (₹)
                    </label>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                       <tr>
                          <th className="px-4 py-3 text-center w-16">Sr No</th>
                          <th className="px-4 py-3 text-left">Investment Date</th>
                          {viewOptions.nav && <th className="px-4 py-3 text-right text-blue-600">NAV (₹)</th>}
                          
                          {/* Normal SIP Columns */}
                          {viewOptions.units && <th className="px-4 py-3 text-right border-l border-slate-200">Normal SIP Units</th>}
                          {viewOptions.cumulativeUnits && <th className="px-4 py-3 text-right border-l border-slate-200">Normal Cum. Units</th>}
                          {viewOptions.currentValue && <th className="px-4 py-3 text-right border-l border-slate-200 bg-blue-50/30">Normal Cur. Value</th>}

                          {/* Top Up SIP Columns */}
                          {enableTopUp && (
                            <>
                              {viewOptions.units && <th className="px-4 py-3 text-right border-l border-purple-100 text-purple-700">Top Up Units</th>}
                              {viewOptions.cumulativeUnits && <th className="px-4 py-3 text-right border-l border-purple-100 text-purple-700">Top Up Cum. Units</th>}
                              {viewOptions.currentValue && <th className="px-4 py-3 text-right border-l border-purple-100 bg-purple-50/30 text-purple-700">Top Up Cur. Value</th>}
                            </>
                          )}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {reportData.details.map((row, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                             <td className="px-4 py-3 text-center text-slate-500">{row.srNo}</td>
                             <td className="px-4 py-3 font-medium text-slate-700">{row.date}</td>
                             {viewOptions.nav && <td className="px-4 py-3 text-right text-blue-600 font-medium">{row.nav.toFixed(4)}</td>}

                             {viewOptions.units && <td className="px-4 py-3 text-right border-l border-slate-200 text-slate-600">{row.units.toFixed(4)}</td>}
                             {viewOptions.cumulativeUnits && <td className="px-4 py-3 text-right border-l border-slate-200 text-slate-600">{row.cumulativeUnits.toFixed(4)}</td>}
                             {viewOptions.currentValue && <td className="px-4 py-3 text-right border-l border-slate-200 font-bold text-slate-800 bg-blue-50/10">{row.currentValue.toLocaleString()}</td>}

                             {enableTopUp && (
                               <>
                                 {viewOptions.units && <td className="px-4 py-3 text-right border-l border-purple-100 text-purple-600">{row.topUpUnits.toFixed(4)}</td>}
                                 {viewOptions.cumulativeUnits && <td className="px-4 py-3 text-right border-l border-purple-100 text-purple-600">{row.topUpCumulativeUnits.toFixed(4)}</td>}
                                 {viewOptions.currentValue && <td className="px-4 py-3 text-right border-l border-purple-100 font-bold text-purple-800 bg-purple-50/10">{row.topUpCurrentValue.toLocaleString()}</td>}
                               </>
                             )}
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
            
            <div className="text-center text-xs text-slate-400 pb-12">
               <p className="mb-2">Note: 1. "Current Value" will be calculated based on latest NAV available in the System.</p>
               <p>2. Past performance is not an indicator of future returns.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SIPMovement;