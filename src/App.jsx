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
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import ResetPassword from './components/ResetPassword'; // 👈 Tambahan komponen Reset Password

// 🛡️ Satpam Global (Axios Interceptor) yang Lebih Pintar
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Cek apakah error ini berasal dari proses nge-hit API '/login'
        const isLoginRequest = error.config && error.config.url && error.config.url.includes('/login');

        // Kalau token mati (401) DAN BUKAN lagi nyoba login, baru tendang keluar
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
                {/* 🔓 Jalur Publik */}
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} /> {/* 👈 Rute Publik Baru */}

                {/* 🔐 Jalur Privat */}
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