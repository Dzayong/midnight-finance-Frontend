/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, ArrowRightLeft, Wallet, Settings, 
    LogOut, User, ChevronRight, Gem, Menu, X, BarChart3 
} from 'lucide-react';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Ambil data user dari localStorage
    const [userData] = useState(() => {
        const data = localStorage.getItem('user');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (err) {
                console.error("Gagal sinkronisasi data user", err);
                return null;
            }
        }
        return null;
    });

    // Jalur Navigasi Konsisten
    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Transaksi', path: '/transactions', icon: ArrowRightLeft },
        { name: 'Portofolio Keuangan', path: '/accounts', icon: Wallet },
        { name: 'Analisis', path: '/analytics', icon: BarChart3 },
        { name: 'Pengaturan', path: '/settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="h-screen w-full bg-[#020617] text-slate-200 flex overflow-hidden font-sans selection:bg-amber-500/30">
            
            {/* OVERLAY MOBILE */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[45] md:hidden transition-opacity duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed md:relative top-0 left-0 h-full w-72 bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 
                flex flex-col z-50 transition-transform duration-500 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                
                {/* Logo Section */}
                <div className="p-8 mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-600/20">
                            <Gem size={28} className="text-slate-900" />
                        </div>
                        <div className="text-left">
                            <span className="text-xl font-black tracking-tighter text-white block leading-none italic uppercase">MIDNIGHT</span>
                            <span className="text-[10px] text-amber-500 font-bold tracking-[0.3em] uppercase">Private Wealth</span>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 p-2 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                                    isActive 
                                    ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* ICON ANIMASI SULTAN KEMBALI */}
                                    <item.icon 
                                        size={20} 
                                        style={{
                                            transitionDelay: isSidebarOpen ? `${index * 150}ms` : '0ms'
                                        }}
                                        className={`
                                            transition-all duration-700 ease-in-out
                                            ${isSidebarOpen ? 'rotate-[360deg]' : 'rotate-0'} 
                                            md:rotate-0 md:group-hover:rotate-[360deg]
                                            ${isActive ? 'text-amber-500' : 'group-hover:text-amber-400'}
                                        `} 
                                    />
                                    <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="text-amber-500" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Profile Section */}
                <div className="p-6 border-t border-white/5 bg-slate-950/30">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-6 group">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30 bg-slate-800 flex items-center justify-center shadow-inner shrink-0">
                            {userData?.avatar ? (
                                <img 
                                    src={userData.avatar} 
                                    alt="Profile" 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                            ) : (
                                <User size={20} className="text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                            )}
                        </div>
                        <div className="overflow-hidden text-left flex-1 w-0">
                            <p className="text-sm font-bold text-white truncate">
                                {userData?.name || 'Member VIP'}
                            </p>
                            <p className="text-[10px] text-amber-500/80 font-bold tracking-widest truncate mt-0.5">
                                {userData?.email || 'user@midnight.com'}
                            </p>
                        </div>
                    </div>
                    
                    <button onClick={handleLogout} className="flex items-center gap-4 text-slate-500 hover:text-rose-500 transition-colors ml-2 group w-full text-left">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN AREA */}
            <main className="flex-1 h-full flex flex-col relative overflow-hidden">
                
                {/* Header Mobile Only */}
                <header className="md:hidden flex items-center justify-between p-6 bg-[#020617]/80 backdrop-blur-xl z-40 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Gem size={24} className="text-amber-500" />
                        <span className="font-black italic tracking-tighter">MIDNIGHT</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-900 rounded-xl border border-white/10 hover:border-amber-500/50 transition-colors">
                        <Menu size={24} className="text-amber-500" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
                    
                    <div className="p-4 md:p-12 max-w-7xl mx-auto w-full pb-32">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainLayout;