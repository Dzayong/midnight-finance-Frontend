import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

// Layout & UI
import MainLayout from './layouts/MainLayout';

// Pages & Components
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import FinancialAccounts from './components/FinancialAccounts';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics'; // Pastikan file ini sudah dibuat
import Settings from './components/Settings';

// Satpam Global (Axios Interceptor)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Protected Route Guard
const PrivateRoute = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user) return <Navigate to="/login" replace />;

    // Paksa ke setup jika status inactive
    if (user.status === 'inactive' && window.location.pathname !== '/setup') {
        return <Navigate to="/setup" replace />;
    }

    return <Outlet />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Jalur Publik */}
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />

                {/* Jalur Privat */}
                <Route element={<PrivateRoute />}>
                    <Route path="/setup" element={<Setup />} />
                    
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/accounts" element={<FinancialAccounts />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;