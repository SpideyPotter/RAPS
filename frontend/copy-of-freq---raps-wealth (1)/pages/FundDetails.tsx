import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Calendar, ChevronLeft, ChevronRight, FileText, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOCK_FUNDS, generateNavHistory } from '../services/mockData';
import { Fund, RiskLevel } from '../types';

const FundDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [fund, setFund] = useState<Fund | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Accordion States
  const [expandedSections, setExpandedSections] = useState({
    portfolioSummary: true,
    portfolioDetails: true,
    schemeDocs: false,
    assetAllocation: true,
    lumpsumPerf: true
  });

  useEffect(() => {
    const found = MOCK_FUNDS.find(f => f.id === id) || MOCK_FUNDS[0];
    setFund(found);

    // Generate Mock Chart Data for "NAV Movement"
    const history = generateNavHistory(found.nav, 90); // 3 months history mock
    // Mock Benchmark Data
    let bmVal = found.nav * 0.95;
    const chartData = history.map(point => {
       bmVal = bmVal * (1 + (Math.random() * 0.02 - 0.009));
       return {
         date: point.date.slice(5), // MM-DD
         nav: point.nav,
         benchmark: Number(bmVal.toFixed(2))
       };
    }).reverse(); // chronological
    setChartData(chartData);

  }, [id]);

  if (!fund) return <div className="p-20 text-center text-slate-500">Loading Scheme Details...</div>;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Riskometer Component ---
  const Riskometer = ({ level }: { level: RiskLevel }) => {
    const levels = ['Low', 'Moderately Low', 'Moderate', 'Moderately High', 'High', 'Very High'];
    const index = levels.indexOf(level);
    const rotation = -90 + (index * (180 / (levels.length - 1)));
    
    return (
      <div className="flex flex-col items-center h-full justify-center py-4">
        <div className="relative w-48 h-24 overflow-hidden">
          <div className="absolute w-48 h-48 rounded-full border-[14px] border-slate-100 box-border" 
               style={{ 
                 background: 'conic-gradient(from 270deg, #22c55e 0deg 30deg, #84cc16 30deg 60deg, #eab308 60deg 90deg, #f97316 90deg 120deg, #ef4444 120deg 150deg, #b91c1c 150deg 180deg, transparent 180deg)',
                 clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                 transform: 'rotate(0deg)'
               }}></div>
           <div className="absolute top-[14px] left-[14px] w-[164px] h-[164px] bg-white rounded-full z-10"></div>
           <div 
             className="absolute bottom-0 left-1/2 w-1.5 h-[88px] bg-slate-800 origin-bottom transition-transform duration-700 z-20"
             style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
           >
             <div className="w-3 h-3 bg-slate-800 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2"></div>
             <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-slate-800 absolute -top-2 left-1/2 -translate-x-1/2"></div>
           </div>
        </div>
        <div className="flex justify-between w-full max-w-[190px] text-[10px] font-bold uppercase mt-2 text-slate-400">
          <span>Low</span>
          <span>Very High</span>
        </div>
        <div className="mt-2 font-bold text-slate-800 text-sm bg-slate-100 px-3 py-1 rounded-full">{level}</div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 font-sans text-slate-800">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* --- BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* --- Header (Full Width) --- */}
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
                <div>
                   <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{fund.name}</h1>
                   <div className="flex gap-4 text-sm">
                      <span className="text-blue-600 font-medium cursor-pointer hover:underline">Scheme Details</span>
                   </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                   <div className="text-3xl font-bold text-blue-600">₹{fund.aum} <span className="text-sm text-slate-500 font-normal">Cr.</span></div>
                   <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">AUM (CR.)</div>
                </div>
             </div>
             
             {/* NAV Strip */}
             <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-slate-100 pt-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">NAV</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900">₹{fund.nav.toFixed(2)}</span>
                    <span className={`text-sm font-bold ${fund.cagr1y >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                       ({fund.cagr1y >= 0 ? '-' : '+'}0.89%)
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 h-full self-end pb-1.5">
                   Change Previous Day <span className="text-slate-300 mx-1">|</span> As On {new Date().toLocaleDateString('en-GB')} <Calendar size={12} />
                </div>
             </div>
          </div>

          {/* --- Scheme Details (Left Box) --- */}
          <div className="col-span-12 md:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-blue-600 mb-6">Scheme Details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-5">
                     {[
                       { l: 'Nature', v: fund.nature },
                       { l: 'Date of Inception', v: fund.inceptionDate },
                       { l: 'Options Available', v: fund.options },
                       { l: 'Exit Load', v: fund.exitLoad },
                     ].map((item, i) => (
                       <div key={i}>
                          <p className="text-xs text-slate-500 mb-1">{item.l}</p>
                          <p className="font-bold text-slate-800 text-sm">{item.v}</p>
                       </div>
                     ))}
                  </div>
                  <div className="space-y-5">
                     {[
                       { l: 'Category', v: fund.category },
                       { l: 'Age', v: fund.age },
                       { l: 'Expense Ratio', v: `${fund.expenseRatio}%`, c: 'text-green-600' },
                       { l: 'Benchmark', v: fund.benchmark },
                     ].map((item, i) => (
                       <div key={i}>
                          <p className="text-xs text-slate-500 mb-1">{item.l}</p>
                          <p className={`font-bold text-sm ${item.c || 'text-slate-800'}`}>{item.v}</p>
                       </div>
                     ))}
                  </div>
              </div>
          </div>

          {/* --- Riskometer (Right Box) --- */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Scheme Riskometer</h3>
             <div className="flex-1 flex items-center justify-center">
                <Riskometer level={fund.risk} />
             </div>
          </div>

          {/* --- Fund Manager --- */}
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <span className="text-xs">FM</span>
                </div>
                <h3 className="text-lg font-bold text-blue-600">Fund Manager</h3>
             </div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                      <span className="font-bold text-slate-400 text-xl">img</span>
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-800 text-lg">{fund.fundManager} <span className="text-xs font-normal text-slate-500 ml-1">{fund.managerEducation}</span></h3>
                      <p className="text-xs text-slate-500 mt-1">{fund.managerExperience}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{fund.managerSchemesCount}</p>
                   </div>
                </div>
                <button className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">
                   View Details
                </button>
             </div>
          </div>

          {/* --- NAV Movement Chart (NEW FEATURE) --- */}
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">NAV Movement</h3>
                <div className="flex items-center gap-4">
                   <div className="hidden md:block">
                      <label className="text-xs text-slate-500 mr-2">Year</label>
                      <select className="border border-slate-200 rounded text-xs px-2 py-1 bg-white text-slate-700">
                        <option>Custom</option>
                        <option>1 Year</option>
                        <option>3 Years</option>
                      </select>
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="date" className="border border-slate-200 rounded text-xs px-2 py-1 bg-white text-slate-600" defaultValue="2023-01-01"/>
                      <input type="date" className="border border-slate-200 rounded text-xs px-2 py-1 bg-white text-slate-600" defaultValue="2023-10-01"/>
                      <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">Submit</button>
                   </div>
                </div>
             </div>
             
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="nav" name={`${fund.name}`} stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="benchmark" name={`${fund.benchmark}`} stroke="#3b82f6" strokeWidth={2} dot={false} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* --- Portfolio Summary (Accordion) --- */}
          <div className="col-span-12 md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <button 
               onClick={() => toggleSection('portfolioSummary')}
               className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
             >
                <span className="font-bold text-slate-800 text-lg">Portfolio Summary</span>
                {expandedSections.portfolioSummary ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
             </button>
             
             {expandedSections.portfolioSummary && (
                <div className="px-6 pb-6 animate-fade-in">
                   {/* Top Holdings */}
                   <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-slate-700 text-sm">Top Holdings</h4>
                         <ChevronDown size={14} className="text-slate-400" />
                      </div>
                      <ul className="space-y-3">
                         {fund.holdings.slice(0, 4).map((h, i) => (
                            <li key={i} className="relative pt-1">
                               <div className="flex justify-between items-center text-xs font-medium z-10 relative mb-1">
                                  <span className="text-slate-600">{h.name}</span>
                                  <span className="text-slate-500">{h.asset}%</span>
                               </div>
                               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-100 rounded-full" style={{ width: `${h.asset * 5}%` }}></div>
                               </div>
                            </li>
                         ))}
                      </ul>
                   </div>

                   {/* Top Sector Holdings */}
                   <div>
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-slate-700 text-sm">Top Sector Holdings</h4>
                         <ChevronDown size={14} className="text-slate-400" />
                      </div>
                      <ul className="space-y-3">
                         {fund.sectors.slice(0, 4).map((s, i) => (
                            <li key={i} className="relative pt-1">
                               <div className="flex justify-between items-center text-xs font-medium z-10 relative mb-1">
                                  <span className="text-slate-600">{s.name}</span>
                                  <span className="text-slate-500">{s.asset}%</span>
                               </div>
                               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.asset * 2}%` }}></div>
                               </div>
                            </li>
                         ))}
                      </ul>
                   </div>
                </div>
             )}
          </div>

          {/* --- Asset Allocation --- */}
          <div className="col-span-12 md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <button 
               onClick={() => toggleSection('assetAllocation')}
               className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
             >
                <span className="font-bold text-slate-800 text-lg">Asset Allocation</span>
                {expandedSections.assetAllocation ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
             </button>
             {expandedSections.assetAllocation && (
                <div className="px-6 pb-8">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                            <span>Equity</span>
                            <span>{fund.assetAllocation?.equity}%</span>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${fund.assetAllocation?.equity}%` }}></div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                            <span>Debt</span>
                            <span>{fund.assetAllocation?.debt}%</span>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${fund.assetAllocation?.debt}%` }}></div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                            <span>Others</span>
                            <span>{fund.assetAllocation?.others}%</span>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${fund.assetAllocation?.others}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* --- Portfolio Details Table --- */}
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <button 
               onClick={() => toggleSection('portfolioDetails')}
               className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
             >
                <span className="font-bold text-slate-800 text-lg">Portfolio Details</span>
                {expandedSections.portfolioDetails ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
             </button>
             
             {expandedSections.portfolioDetails && (
                <div className="px-6 pb-6">
                   <div className="flex gap-4 mb-4 border-b border-slate-100">
                      <div className="pb-2 border-b-2 border-blue-500 text-blue-600 font-bold text-sm px-4">Equity</div>
                      <div className="pb-2 text-slate-400 text-sm px-4">Others</div>
                   </div>
                   
                   <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                         <thead className="text-xs text-slate-400 font-bold border-b border-slate-100">
                            <tr>
                               <th className="py-3 pr-4">Scheme Name <ChevronDown size={12} className="inline ml-1" /></th>
                               <th className="py-3 px-4">Sector <ChevronDown size={12} className="inline ml-1" /></th>
                               <th className="py-3 px-4 text-right">% of Total Assets <ChevronDown size={12} className="inline ml-1" /></th>
                               <th className="py-3 pl-4 text-right">Cumulative%</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {fund.holdings.map((h, i) => (
                               <tr key={i} className="hover:bg-slate-50">
                                  <td className="py-3 pr-4 font-medium text-slate-700">{h.name}</td>
                                  <td className="py-3 px-4 text-slate-500">{h.sector}</td>
                                  <td className="py-3 px-4 text-right text-slate-700">{h.asset}</td>
                                  <td className="py-3 pl-4 text-right text-slate-500">{h.cumulative}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             )}
          </div>

          {/* --- Lumpsum Performance --- */}
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-12">
             <button 
               onClick={() => toggleSection('lumpsumPerf')}
               className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
             >
                <div>
                   <span className="font-bold text-slate-800 text-lg block text-left">Lumpsum Performance</span>
                   <span className="text-xs text-slate-400 block text-left mt-1 font-normal">Annualised Returns. (Absolute returns for &lt; 1 year) If you had invested ₹10,000</span>
                </div>
                {expandedSections.lumpsumPerf ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
             </button>
             
             {expandedSections.lumpsumPerf && (
                <div className="px-6 pb-6 overflow-x-auto">
                   <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 font-bold border-b border-slate-100">
                         <tr>
                            <th className="py-3 pr-4">Period</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                            <th className="py-3 px-4 text-right">Scheme</th>
                            <th className="py-3 pl-4 text-right">Benchmark</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {fund.lumpsumPerf?.map((row, i) => (
                            <tr key={i}>
                               <td className="py-3 pr-4 text-slate-600 font-medium">{row.period}</td>
                               <td className="py-3 px-4 text-right text-slate-800">{row.amount.toLocaleString()}</td>
                               <td className={`py-3 px-4 text-right font-bold ${row.scheme < 0 ? 'text-red-500' : 'text-slate-800'}`}>{row.scheme}%</td>
                               <td className="py-3 pl-4 text-right text-slate-500">{row.benchmark}%</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FundDetails;