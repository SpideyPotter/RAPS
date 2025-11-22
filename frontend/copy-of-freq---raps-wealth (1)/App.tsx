import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Funds from './pages/Funds';
import FundDetails from './pages/FundDetails';
import RAPSCalculator from './pages/RAPSCalculator';
import SIPMovement from './pages/SIPMovement';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/funds/:id" element={<FundDetails />} />
          <Route path="/calculator" element={<RAPSCalculator />} />
          <Route path="/sip-movement" element={<SIPMovement />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;