/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutConfirmationPage from './pages/CheckoutConfirmationPage';
import AccountPage from './pages/AccountPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SupportChat from './components/chat/SupportChat';
import ScrollToTop from './components/layout/ScrollToTop';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Information pages
import ReturnsPage from './pages/info/ReturnsPage';
import FaqPage from './pages/info/FaqPage';
import ShippingTimePage from './pages/info/ShippingTimePage';
import TermsPage from './pages/info/TermsPage';
import PrivacyPage from './pages/info/PrivacyPage';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#0A0A0C] font-sans text-white flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/confirmacion" element={<CheckoutConfirmationPage />} />
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/cuenta/pedidos/:id" element={<OrderDetailPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            
            <Route path="/retornos" element={<ReturnsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/envios" element={<ShippingTimePage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
          </Routes>
        </main>
        <Footer />
        <SupportChat />
      </div>
    </Router>
  );
}
