import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, ShieldCheck, PieChart, BarChart2, Target } from 'lucide-react';
import { MOCK_FUNDS } from '../services/mockData';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Check for exact match (case-insensitive)
      const exactMatch = MOCK_FUNDS.find(
        f => f.name.toLowerCase() === searchTerm.trim().toLowerCase()
      );

      if (exactMatch) {
        navigate(`/funds/${exactMatch.id}`);
      } else {
        navigate(`/funds?q=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-slate-800 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/1920/1080')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-secondary/20 border border-secondary/50 rounded-full px-4 py-1 mb-6">
              <span className="text-secondary font-semibold text-sm tracking-wide">INTELLIGENT INVESTING</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Grow Your Wealth with <span className="text-secondary">Data-Driven</span> Decisions
            </h1>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl">
              Experience the power of AI-enhanced portfolio management. Analyze, predict, and optimize your mutual fund investments with RAPS Wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/funds" className="bg-secondary hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold transition-all text-center shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                Explore Mutual Funds <ArrowRight size={20} />
              </Link>
              <Link to="/calculator" className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold transition-all text-center border border-slate-200 flex items-center justify-center gap-2">
                Try RAPS Calculator <TrendingUp size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white -mt-8 relative z-20 mb-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-slate-100 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={24} />
              <input
                type="text"
                placeholder="Search for mutual funds (e.g., Bluechip, Midcap)..."
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                list="fund-suggestions"
              />
              <button type="submit" className="absolute right-2 bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-slate-800 transition-colors">
                Search
              </button>
              <datalist id="fund-suggestions">
                {MOCK_FUNDS.map(f => <option key={f.id} value={f.name} />)}
              </datalist>
            </form>
            <div className="flex flex-wrap gap-2 mt-4 text-sm text-slate-500">
              <span>Trending:</span>
              <button className="hover:text-secondary underline decoration-secondary/30">RAPS Bluechip</button>
              <button className="hover:text-secondary underline decoration-secondary/30">Midcap Opportunities</button>
              <button className="hover:text-secondary underline decoration-secondary/30">Tax Saver</button>
            </div>
          </div>
        </div>
      </section>

      {/* Mutual Funds Intro */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Why Mutual Funds?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Professional management, diversification, and liquidity make mutual funds an ideal choice for wealth creation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Target size={32} />, title: 'Equity Funds', desc: 'High growth potential for long-term goals.', color: 'bg-blue-100 text-blue-600' },
              { icon: <ShieldCheck size={32} />, title: 'Debt Funds', desc: 'Stable returns with lower risk profile.', color: 'bg-green-100 text-green-600' },
              { icon: <PieChart size={32} />, title: 'Hybrid Funds', desc: 'Balanced approach for moderate risk.', color: 'bg-purple-100 text-purple-600' },
            ].map((card, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
                <div className={`w-16 h-16 rounded-full ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{card.title}</h3>
                <p className="text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6">The Investment Dilemma</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-1 h-full bg-red-500 rounded-full"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Information Overload</h4>
                    <p className="text-slate-500">Thousands of schemes make it hard to choose the right one.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 h-full bg-red-500 rounded-full"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Emotional Decisions</h4>
                    <p className="text-slate-500">Buying high and selling low due to market panic.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 bg-slate-900 text-white p-10 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary rounded-full filter blur-3xl opacity-20 translate-x-10 -translate-y-10"></div>
              <h2 className="text-3xl font-bold mb-6 text-secondary">The RAPS Solution</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                We use advanced algorithms to simplify your journey. Our RAPS Engine analyzes market trends, fund manager performance, and risk metrics to curate the perfect basket for you.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <BarChart2 className="text-secondary mb-2" size={24} />
                  <h4 className="font-bold">Smart Analytics</h4>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <TrendingUp className="text-secondary mb-2" size={24} />
                  <h4 className="font-bold">NAV Prediction</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;