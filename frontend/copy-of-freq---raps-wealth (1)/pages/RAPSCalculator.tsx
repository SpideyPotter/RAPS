import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Calendar, Settings, Download, RefreshCw, 
  TrendingUp, Activity, LayoutGrid, Plus, Trash2, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ComposedChart, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { MOCK_FUNDS, generateDashboardData } from '../services/mockData';
import { DashboardData } from '../types';

const RAPSCalculator: React.FC = () => {
  // --- State ---
  const [basketIds, setBasketIds] = useState<string[]>([MOCK_FUNDS[0].id, MOCK_FUNDS[1].id, MOCK_FUNDS[2].id]);
  const [horizon, setHorizon] = useState(90); // 30, 90, 365
  const [data, setData] = useState<DashboardData | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- Mock Computation Effect ---
  useEffect(() => {
    const newData = generateDashboardData(basketIds, horizon);
    setData(newData);
  }, [basketIds, horizon]);

  const toggleFund = (id: string) => {
    if (basketIds.includes(id)) {
      setBasketIds(basketIds.filter(b => b !== id));
    } else {
      if (basketIds.length < 5) setBasketIds([...basketIds, id]);
      else alert("Max 5 funds for visual clarity in dashboard.");
    }
  };

  if (!data) return <div className="flex items-center justify-center h-screen text-slate-500">Initializing RAPS Engine...</div>;

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-100 overflow-hidden font-sans text-slate-800">
      
      {/* --- Sidebar: Basket Management --- */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
             <BrainCircuit size={18} className="text-secondary" /> RAPS Engine
          </h2>
          <p className="text-[10px] text-slate-400 uppercase mt-1">Input Parameters</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Forecast Horizon</label>
            <div className="flex bg-slate-100 rounded-lg p-1">
              {[30, 90, 365].map(d => (
                <button 
                  key={d} 
                  onClick={() => setHorizon(d)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${horizon === d ? 'bg-white shadow text-secondary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Current Basket</label>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{basketIds.length}/5</span>
            </div>
            <div className="space-y-2">
               {basketIds.map(id => {
                 const f = MOCK_FUNDS.find(mf => mf.id === id);
                 return (
                   <div key={id} className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex justify-between items-center">
                      <div className="truncate mr-2">
                        <div className="text-xs font-bold text-slate-700 truncate">{f?.name}</div>
                        <div className="text-[10px] text-slate-400">{f?.category}</div>
                      </div>
                      <button onClick={() => toggleFund(id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                   </div>
                 )
               })}
            </div>
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Available Funds</label>
             <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {MOCK_FUNDS.filter(f => !basketIds.includes(f.id)).map(f => (
                   <button 
                     key={f.id}
                     onClick={() => toggleFund(f.id)} 
                     className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 flex justify-between items-center group"
                   >
                     <span className="text-slate-600 truncate w-32">{f.name}</span>
                     <Plus size={12} className="text-slate-300 group-hover:text-secondary" />
                   </button>
                ))}
             </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100">
           <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg">
             <RefreshCw size={16} /> Re-Run Models
           </button>
        </div>
      </div>

      {/* --- Main Dashboard Grid --- */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)}
             className="bg-white p-2 rounded-md border border-slate-200 text-slate-600 hover:text-secondary"
           >
             <Settings size={18} />
           </button>
           
           <div className="flex gap-2">
              <div className="bg-white px-4 py-1.5 rounded-md border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-600">
                 <Calendar size={14} className="text-slate-400" /> {new Date().toLocaleDateString()}
              </div>
              <button className="bg-white px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-secondary flex items-center gap-2 text-xs font-bold">
                 <Download size={14} /> Export PDF
              </button>
           </div>
        </div>

        {/* 3x3 Bento Grid (Adjusted for Removed PCA/MPT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
           
           {/* 1. NAV Forecast (ARIMA/LSTM) */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-80 lg:col-span-2">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><TrendingUp size={14} className="text-secondary" /> NAV Forecast (ARIMA + LSTM)</h3>
                 <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">+{data.kpis.expectedReturn}% Exp</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.navForecast} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                     <defs>
                        <linearGradient id="colorCi" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" tick={false} stroke="#94a3b8" />
                     <YAxis domain={['auto', 'auto']} hide />
                     <Tooltip 
                        contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                        itemStyle={{ padding: 0 }}
                     />
                     <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                     {/* Confidence Interval Area */}
                     <Area type="monotone" dataKey="upperCI" stroke="none" fill="url(#colorCi)" fillOpacity={1} name="95% Conf. Interval" />
                     <Area type="monotone" dataKey="lowerCI" stroke="none" fill="#fff" fillOpacity={1} /> 
                     {/* Lines */}
                     <Line type="monotone" dataKey="historical" stroke="#334155" strokeWidth={2} dot={false} name="Historical" />
                     <Line type="monotone" dataKey="arima" stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} dot={false} name="ARIMA Forecast" />
                     <Line type="monotone" dataKey="lstm" stroke="#f59e0b" strokeDasharray="2 2" strokeWidth={1.5} dot={false} name="LSTM Overlay" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* 2. Volatility Forecast (GARCH) */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-80">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Activity size={14} className="text-orange-500" /> Volatility Forecast (GARCH)</h3>
                 <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">{data.kpis.expectedVol}% Vol</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.volatility}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={false} stroke="#94a3b8" />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="realized" stroke="#64748b" strokeWidth={1.5} dot={false} name="Realized Vol" />
                      <Line type="monotone" dataKey="garchForecast" stroke="#f97316" strokeWidth={2} dot={false} name="GARCH(1,1) Forecast" />
                   </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* 3. Correlation Heatmap */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-80 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><LayoutGrid size={14} className="text-purple-500" /> Correlation Matrix</h3>
                 <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Div Score: {data.kpis.diversificationScore}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                 <div className="grid" style={{ gridTemplateColumns: `repeat(${basketIds.length}, 1fr)`, gap: '2px' }}>
                    {data.correlationMatrix.map((cell, i) => (
                       <div 
                         key={i} 
                         className="w-12 h-12 md:w-14 md:h-14 flex flex-col items-center justify-center rounded text-[10px] font-bold text-white transition-transform hover:scale-110 cursor-pointer relative group"
                         style={{ 
                            backgroundColor: cell.value > 0.7 ? '#ef4444' : cell.value > 0.4 ? '#f59e0b' : '#22c55e',
                            opacity: Math.abs(cell.value) < 0.1 ? 0.1 : Math.abs(cell.value)
                         }}
                       >
                          <span className="z-10">{cell.value.toFixed(2)}</span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[9px] p-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                             {cell.x} vs {cell.y}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-[9px] text-slate-400">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Low</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Med</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> High</div>
              </div>
           </div>

           {/* 4. Rolling Correlations */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-80 lg:col-span-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rolling Correlations (30D)</h3>
              <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.rollingCorrelation}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" tick={false} stroke="#94a3b8" />
                       <YAxis domain={[-1, 1]} hide />
                       <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                       {basketIds.map((id, idx) => {
                          const name = MOCK_FUNDS.find(f=>f.id===id)?.name.split(' ')[1] || 'Fund';
                          return <Line key={id} type="monotone" dataKey={name} stroke={COLORS[idx % COLORS.length]} dot={false} strokeWidth={1.5} />;
                       })}
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* 5. Risk Decomposition */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-64">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Decomposition (VaR)</h3>
                 <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">VaR: {data.kpis.var95}%</span>
              </div>
              <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.riskDecomposition} layout="vertical" margin={{ left: 40 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                       <XAxis type="number" hide />
                       <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 9 }} tickFormatter={(v) => v.split(' ')[1]} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                       <Bar dataKey="contribution" fill="#f87171" radius={[0, 4, 4, 0]} barSize={15} name="% Contribution to Risk" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* 6. Sector Exposure (Simplified - No List) */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-64 lg:col-span-1">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                   <PieChartIcon size={14} className="text-blue-500" /> Sector Exposure
                 </h3>
              </div>
              <div className="flex items-center justify-center h-full w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={data.sectorExposure}
                         innerRadius={50}
                         outerRadius={70}
                         paddingAngle={2}
                         dataKey="value"
                         stroke="none"
                         cx="50%"
                         cy="45%"
                       >
                         {data.sectorExposure.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ fontSize: '10px', borderRadius: '6px', padding: '4px 8px' }} 
                         itemStyle={{ padding: 0 }}
                       />
                       <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '10px', bottom: 0 }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Centered Label */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
                    <span className="text-xs font-bold text-slate-400 opacity-50">SECTORS</span>
                 </div>
              </div>
           </div>

           {/* 7. KPI Summary Cards (Vertical Stack, Removed Optimal Allocation) */}
           <div className="flex flex-col gap-4 h-64 lg:col-span-1">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-1 flex-col justify-center items-center text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Sharpe Ratio</p>
                  <h2 className="text-3xl font-bold text-slate-800">{data.kpis.sharpe}</h2>
                  <p className="text-[10px] text-green-500 font-medium">Top 10% Peer Group</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-1 flex-col justify-center items-center text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Diversification</p>
                  <h2 className="text-3xl font-bold text-blue-600">{data.kpis.diversificationScore}</h2>
                  <p className="text-[10px] text-slate-400">Score (0-1)</p>
               </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default RAPSCalculator;