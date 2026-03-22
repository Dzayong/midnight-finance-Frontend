import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, // 👈 Tambah ArrowRightLeft
    History, TrendingUp, TrendingDown, 
    Wallet, Eye, EyeOff, PlusCircle 
} from 'lucide-react';
import { GoldButton } from './ui/Button';

// IMPORT MODAL
import TransactionModal from './modals/TransactionModal';
import AccountModal from './modals/AccountModal';

const Dashboard = () => {
    const [viewMode, setViewMode] = useState('total'); 
    const [showBalance, setShowBalance] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    
    // Data State
    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [stats, setStats] = useState({ income: 0, expense: 0, total_balance: 0 });

    // Modal Toggle State
    const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

    // FUNGSI UTAMA: Ambil Data dari API Dashboard (1 Panggilan Super Ringan!)
    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // SATU TEMBAKAN KE BACKEND! 🚀
            const res = await axios.get(`${baseURL}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Pecah bingkisan JSON dari Laravel
            const { user, wallets, stats, recent_transactions } = res.data.data;

            // Langsung pasang ke State
            setUserData(user);
            setWallets(wallets || []);
            setStats({
                income: stats.income_this_month || 0,
                expense: stats.expense_this_month || 0,
                total_balance: stats.total_balance || 0
            });
            setTransactions(recent_transactions || []);

        } catch (err) {
            console.error("Gagal menarik data dashboard:", err);
            // Kalau error, tolak balik ke Login (Keamanan tambahan)
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [baseURL]);

    if (isLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-amber-500 font-bold tracking-[0.3em] text-[10px] uppercase animate-pulse italic">Menyinkronkan Brankas...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            
            {/* 1. HEADER LUXURY SWITCHER */}
            <div className="luxury-card p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 relative overflow-hidden border-amber-500/10">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-white text-xl font-black italic tracking-tight uppercase">PROFIL: {userData?.name || 'SULTAN'}</h1>
                            <div className="flex gap-2 mt-4 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
                                <button onClick={() => setViewMode('total')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'total' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}>Total Saldo</button>
                                <button onClick={() => setViewMode('bulanan')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'bulanan' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}>{currentMonth}</button>
                            </div>
                        </div>
                        <button onClick={() => setShowBalance(!showBalance)} className="hidden md:flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors text-[10px] font-bold uppercase tracking-widest">
                            {showBalance ? <><EyeOff size={16}/> Sembunyikan</> : <><Eye size={16}/> Tampilkan</>}
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 mb-2">{viewMode === 'total' ? 'KEKAYAAN BERSIH GABUNGAN' : 'SISA SALDO BULAN INI'}</p>
                            <h2 className="text-5xl font-black text-white italic tracking-tighter">
                                {/* 💡 PEMBASMI DESIMAL DI TOTAL SALDO */}
                                {showBalance ? `Rp ${Math.floor(Number(viewMode === 'total' ? stats.total_balance : (stats.income - stats.expense))).toLocaleString('id-ID')}` : 'Rp •••••••••'}
                            </h2>
                        </div>

                        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 custom-scrollbar">
                            {viewMode === 'total' ? (
                                <>
                                    {wallets.map(w => (
                                        <div key={w.id} className="min-w-[160px] bg-white/5 border border-white/5 p-4 rounded-2xl">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{w.name}</p>
                                            {/* 💡 PEMBASMI DESIMAL DI KARTU DOMPET */}
                                            <p className="text-sm font-black text-slate-200">{showBalance ? `Rp ${Math.floor(Number(w.balance)).toLocaleString('id-ID')}` : '••••'}</p>
                                        </div>
                                    ))}
                                    <button onClick={() => setIsAccountModalOpen(true)} className="flex items-center gap-2 px-4 border border-dashed border-white/10 rounded-2xl hover:border-amber-500/50 transition-all group">
                                        <PlusCircle size={16} className="text-amber-500 group-hover:rotate-90 transition-transform"/>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">Tambah Akun</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="min-w-[160px] bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="text-emerald-500"><TrendingUp size={20}/></div>
                                        {/* 💡 PEMBASMI DESIMAL DI PEMASUKAN */}
                                        <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Masuk</p><p className="text-sm font-black text-white italic">Rp {Math.floor(Number(stats.income)).toLocaleString('id-ID')}</p></div>
                                    </div>
                                    <div className="min-w-[160px] bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="text-rose-400"><TrendingDown size={20}/></div>
                                        {/* 💡 PEMBASMI DESIMAL DI PENGELUARAN */}
                                        <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Keluar</p><p className="text-sm font-black text-white italic">Rp {Math.floor(Number(stats.expense)).toLocaleString('id-ID')}</p></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. AKTIVITAS TERKINI LIST */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                    <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3 text-white">
                        <History className="text-amber-500" size={24} /> AKTIVITAS TERKINI
                    </h2>
                    <GoldButton onClick={() => setIsTrxModalOpen(true)} className="md:w-auto w-full">
                        <Plus size={18} /> Catat Transaksi
                    </GoldButton>
                </div>

                <div className="luxury-card p-2 md:p-6">
                    <div className="space-y-2 text-left">
                        {transactions.slice(0, 10).map((trx) => {
                            // 💡 LOGIKA SATPAM UI TRANSAKSI (Sama seperti halaman History)
                            let ui = { bg: 'bg-slate-500/10 text-slate-500', text: 'text-slate-400', sign: '', icon: <ArrowDownLeft size={22}/> };
                            const desc = trx.description ? trx.description.toUpperCase() : '';
                            
                            if (trx.type === 'income') {
                                ui = { bg: 'bg-emerald-500/10 text-emerald-500', text: 'text-emerald-400', sign: '+', icon: <ArrowUpRight size={22}/> };
                            } else if (trx.type === 'expense') {
                                ui = { bg: 'bg-rose-500/10 text-rose-500', text: 'text-rose-400', sign: '-', icon: <ArrowDownLeft size={22}/> };
                            } else if (trx.type === 'transfer') {
                                if (desc.includes('KELUAR')) {
                                    ui = { bg: 'bg-amber-500/10 text-amber-500', text: 'text-amber-400', sign: '-', icon: <ArrowRightLeft size={22}/> };
                                } else if (desc.includes('MASUK')) {
                                    ui = { bg: 'bg-sky-500/10 text-sky-500', text: 'text-sky-400', sign: '+', icon: <ArrowRightLeft size={22}/> };
                                } else {
                                    ui = { bg: 'bg-slate-500/10 text-slate-500', text: 'text-slate-400', sign: '', icon: <ArrowRightLeft size={22}/> };
                                }
                            }

                            return (
                                <div key={trx.id} className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-[2rem] hover:bg-white/[0.03] transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl ${ui.bg}`}>
                                            {ui.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200 group-hover:text-amber-500 transition-colors uppercase text-sm tracking-wide">
                                                {trx.type === 'transfer' ? 'Mutasi Brankas' : (typeof trx.category === 'object' ? trx.category?.name : (trx.category || 'Tanpa Kategori'))}
                                            </h4>
                                            <div className="flex flex-wrap gap-4 mt-1">
                                                <span className="text-[10px] flex items-center gap-1.5 text-slate-500 font-bold uppercase">
                                                    <Wallet size={12} className="text-amber-500/50" /> 
                                                    {trx.financial_account?.name || trx.account?.name || 'Dompet'}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-bold opacity-50">
                                                    {trx.date ? new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:text-right flex flex-row-reverse md:flex-col justify-between items-center md:items-end">
                                        {/* 💡 PEMBASMI DESIMAL DI RIWAYAT */}
                                        <p className={`text-xl font-black italic ${ui.text}`}> 
                                            {ui.sign} Rp {Math.floor(Number(trx.amount || 0)).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-[11px] text-slate-500 italic truncate max-w-[200px]">
                                            {trx.description || trx.note || '-'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {transactions.length === 0 && (
                            <p className="text-center py-10 text-slate-600 font-bold italic tracking-widest uppercase">Belum ada sejarah transaksi terdeteksi</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PEMANGGILAN MODAL --- */}
            <TransactionModal 
                isOpen={isTrxModalOpen} 
                onClose={() => setIsTrxModalOpen(false)} 
                onSuccess={fetchAllData} 
                wallets={wallets}
            />

            <AccountModal 
                isOpen={isAccountModalOpen} 
                onClose={() => setIsAccountModalOpen(false)} 
                onSuccess={fetchAllData} 
            />

        </div>
    );
};

export default Dashboard;