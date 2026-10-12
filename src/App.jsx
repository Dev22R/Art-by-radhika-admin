import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Designs from './pages/Designs';
import DesignForm from './pages/DesignForm';
import DesignDetail from './pages/DesignDetail';
import PricingPlans from './pages/PricingPlans';
import Reels from './pages/Reels';
import CreateReel from './pages/CreateReel';
import ReelDetail from './pages/ReelDetail';
import Enquiries from './pages/Enquiries';
import Faq from './pages/Faq';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export const App = () => {
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="designs" element={<Designs />} />
            <Route path="designs/create" element={<DesignForm />} />
            <Route path="designs/edit/:designId" element={<DesignForm />} />
            <Route path="designs/:designId" element={<DesignDetail />} />
            <Route path="pricing-plans" element={<PricingPlans />} />
            <Route path="reels" element={<Reels />} />
            <Route path="reels/create" element={<CreateReel />} />
            <Route path="reels/:reelId" element={<ReelDetail />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="faqs" element={<Faq />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
