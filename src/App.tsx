/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutConfirmationPage from './pages/CheckoutConfirmationPage';
import AccountPage from './pages/AccountPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SupportChat from './components/chat/SupportChat';
import ScrollToTop from './components/layout/ScrollToTop';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import { useThemeStore } from './store/theme';

import DynamicPage from './pages/info/DynamicPage';

export default function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'marketplace') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-theme-base font-sans text-theme-text-body flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/confirmacion" element={<CheckoutConfirmationPage />} />
              <Route path="/cuenta" element={<AccountPage />} />
              <Route path="/cuenta/pedidos/:id" element={<OrderDetailPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              
              <Route path="/p/:slug" element={<DynamicPage />} />
            </Routes>
          </main>
          <Footer />
          <SupportChat />
        </div>
      </Router>
    </HelmetProvider>
  );
}
