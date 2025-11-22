import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, X, Check, Info, Scale, TrendingUp, Filter, SlidersHorizontal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOCK_FUNDS, generateNavHistory } from '../services/mockData';

const Funds: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Removed 'Debt' as per instructions to remove scheme types
  const categories = ['All', 'Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap'];

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const filtered = MOCK_FUNDS.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCompare = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("You can compare up to 4 funds at a time.");
      }
    }
  };

  const handleCompareClick = () => {
    const selectedFunds = MOCK_FUNDS.filter(f => selectedIds.includes(f.id));
    const days = 365;
    const histories = selectedFunds.map(f => ({
      id: f.id,
      name: f.name,
      data: generateNavHistory(f.nav, days)
    }));

    const merged = histories[0].data.map((point, index) => {
      const item: any = { date: point.date };
      histories.forEach(h => {
        item[h.name] = h.data[index].nav;
      });
      return item;
    });

    setChartData(merged);
    setIsCompareOpen(true);
  };

  const selectedFundsData = MOCK_FUNDS.filter(f => selectedIds.includes(f.id));
  const colors = ['#059669', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header & Search Area */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 sticky top-[72px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Mutual Fund Explorer</h1>
              <p className="text-sm text-slate-500">Analyze and select from top-performing schemes</p>
            </div>
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-secondary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or AMC..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg mr-2 text-slate-600">
              <Filter size={14} /> <span className="text-xs font-bold uppercase">Filters</span>
            </div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-secondary text-white border-secondary shadow-md shadow-emerald-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-secondary hover:text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="grid grid-cols-1 gap-4">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
             <div className="col-span-1 text-center">Compare</div>
             <div className="col-span-4">Scheme Details</div>
             <div className="col-span-2">Risk Profile</div>
             <div className="col-span-1 text-right">NAV</div>
             <div className="col-span-1 text-right">1Y Returns</div>
             <div className="col-span-1 text-right">3Y Returns</div>
             <div className="col-span-2 text-center"></div>
          </div>

          {filtered.length > 0 ? filtered.map(fund => (
            <div key={fund.id} className={`group bg-white rounded-xl shadow-sm hover:shadow-md border transition-all duration-200 overflow-hidden ${selectedIds.includes(fund.id) ? 'border-secondary ring-1 ring-secondary bg-emerald-50/30' : 'border-slate-100 hover:border-secondary/30'}`}>
               <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center md:justify-center">
                    <button
                      onClick={() => toggleCompare(fund.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.includes(fund.id) ? 'bg-secondary border-secondary text-white scale-110' : 'border-slate-300 text-transparent hover:border-secondary hover:text-secondary/20'}`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                  </div>
                  
                  {/* Scheme Info */}
                  <div className="col-span-4">
                     <Link to={`/funds/${fund.id}`} className="block">
                       <h3 className="font-bold text-slate-800 text-lg group-hover:text-secondary transition-colors mb-1">{fund.name}</h3>
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">{fund.amc}</span>
                         <span className="text-xs text-slate-400">• {fund.category}</span>
                       </div>
                     </Link>
                  </div>

                  {/* Risk Badge */}
                  <div className="col-span-2 flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${
                       fund.risk.includes('High') ? 'bg-red-500' : fund.risk.includes('Moderate') ? 'bg-yellow-500' : 'bg-green-500'
                     }`}></div>
                     <span className="text-sm text-slate-600 font-medium">{fund.risk}</span>
                  </div>

                  {/* Data Points */}
                  <div className="col-span-1 md:text-right flex justify-between md:block border-t md:border-t-0 border-slate-50 pt-2 md:pt-0 mt-2 md:mt-0">
                     <p className="text-xs text-slate-400 md:hidden">NAV</p>
                     <p className="font-bold text-slate-800">₹{fund.nav.toFixed(2)}</p>
                  </div>
                  <div className="col-span-1 md:text-right flex justify-between md:block border-t md:border-t-0 border-slate-50 pt-2 md:pt-0">
                     <p className="text-xs text-slate-400 md:hidden">1Y</p>
                     <p className={`font-bold ${fund.cagr1y >= 15 ? 'text-emerald-600' : 'text-slate-700'}`}>{fund.cagr1y}%</p>
                  </div>
                  <div className="col-span-1 md:text-right flex justify-between md:block border-t md:border-t-0 border-slate-50 pt-2 md:pt-0">
                     <p className="text-xs text-slate-400 md:hidden">3Y</p>
                     <p className={`font-bold ${fund.cagr3y >= 12 ? 'text-emerald-600' : 'text-slate-700'}`}>{fund.cagr3y}%</p>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 flex justify-end md:justify-center mt-4 md:mt-0">
                     <Link to={`/funds/${fund.id}`} className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-secondary hover:text-secondary px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                       Scheme Details <ArrowRight size={14} />
                     </Link>
                  </div>
               </div>
            </div>
          )) : (
            <div className="text-center py-20">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <Search size={24} />
               </div>
               <h3 className="text-lg font-bold text-slate-700">No funds found</h3>
               <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Comparison Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4 animate-slide-up">
          <div className="bg-slate-800/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-lg shadow-inner border-2 border-slate-800">
                  {selectedIds.length}
                </div>
                {selectedIds.length === 4 && (
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-slate-800"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">Compare Schemes</span>
                <span className="text-xs text-slate-400">{selectedIds.length} selected (Max 4)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedIds([])}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Clear All"
              >
                <X size={18} />
              </button>
              <button 
                onClick={handleCompareClick}
                className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
              >
                Compare <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={() => setIsCompareOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in relative z-10">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Scale className="text-secondary" size={24} /> 
                  Comparison Matrix
                </h2>
              </div>
              <button onClick={() => setIsCompareOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Chart */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <TrendingUp size={16} /> Normalized Performance (1 Year)
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={false} stroke="#cbd5e1" />
                        <YAxis domain={['auto', 'auto']} stroke="#cbd5e1" fontSize={12} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        {selectedFundsData.map((fund, index) => (
                          <Line 
                            key={fund.id}
                            type="monotone" 
                            dataKey={fund.name} 
                            stroke={colors[index % colors.length]} 
                            strokeWidth={3} 
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Full Width Table */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="text-left p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-56 sticky left-0 bg-slate-50 backdrop-blur-sm">Parameter</th>
                          {selectedFundsData.map(fund => (
                            <th key={fund.id} className="text-left p-5 min-w-[220px]">
                              <div className="font-bold text-slate-800 text-lg leading-tight mb-1">{fund.name}</div>
                              <div className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">{fund.category}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { label: 'Current NAV', key: 'nav', format: (v: number) => `₹${v.toFixed(2)}`, highlight: true },
                          { label: '1Y Returns', key: 'cagr1y', format: (v: number) => <span className="text-emerald-600 font-bold">+{v}%</span> },
                          { label: '3Y Returns', key: 'cagr3y', format: (v: number) => <span className="text-emerald-600 font-bold">+{v}%</span> },
                          { label: 'Risk Level', key: 'risk', format: (v: string) => <span className={`px-2 py-1 rounded text-xs font-bold ${v.includes('High') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{v}</span> },
                          { label: 'Expense Ratio', key: 'expenseRatio', format: (v: number) => `${v}%` },
                          { label: 'Std Deviation', key: 'stdDev' },
                          { label: 'Sharpe Ratio', key: 'sharpeRatio' },
                          { label: 'Alpha', key: 'alpha' },
                          { label: 'Exit Load', key: 'exitLoad', format: (v: string) => <span className="text-xs text-slate-500">{v}</span> },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-5 text-sm font-semibold text-slate-500 flex items-center gap-1 sticky left-0 bg-white border-r border-slate-50">
                              {row.label} 
                              {row.key === 'sharpeRatio' && <Info size={14} className="text-slate-300" />}
                            </td>
                            {selectedFundsData.map(fund => (
                              <td key={fund.id} className={`p-5 text-slate-700 font-medium ${row.highlight ? 'text-lg' : 'text-sm'}`}>
                                 {/* @ts-ignore */}
                                {row.format ? row.format(fund[row.key]) : fund[row.key]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funds;