import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Calendar, ArrowUpDown, Wallet, Tag, 
    RefreshCcw, Edit3, Trash2, ArrowUpRight, ArrowDownLeft, Plus, Filter
} from 'lucide-react';
import TransactionModal from './modals/TransactionModal';
import CategoryModal from './modals/CategoryModal';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [filters, setFilters] = useState({
        start_date: '', end_date: '', financial_account_id: '', 
        category_id: '', type: '', sort_by: 'date', sort_order: 'desc'
    });

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${baseURL}/transactions`, { 
                params: filters, 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setTransactions(res.data.data || res.data || []);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, [filters, baseURL, token]);

    const fetchMaster = useCallback(async () => {
        try {
            const [resW, resC] = await Promise.all([
                axios.get(`${baseURL}/financial-accounts`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${baseURL}/categories`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setWallets(resW.data.data || resW.data || []);
            setCategories(resC.data.data || resC.data || []);
        } catch (err) { console.error(err); }
    }, [baseURL, token]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { fetchMaster(); }, [fetchMaster]);

    const handleReset = () => {
        setFilters({start_date:'', end_date:'', financial_account_id:'', category_id:'', type:'', sort_by:'date', sort_order:'desc'});
    };

    const handleEditClick = (trx) => {
        setSelectedTransaction(trx);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Hapus transaksi ini? Saldo akan dikembalikan.")) return;
        try {
            await axios.delete(`${baseURL}/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch { alert("Gagal menghapus!"); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 text-left">
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter italic">Riwayat Portofolio</h1>

            {/* PANEL NAVIGASI / FILTER SULTAN (123 / 4567) */}
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-3">
                
                {/* BARIS ATAS (1, 2, 3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Rentang Waktu */}
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Calendar size={14} className="text-amber-500 shrink-0" />
                        <div className="flex items-center gap-2 w-full">
                            <input type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} onClick={(e) => e.target.showPicker?.()} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer [color-scheme:dark]" />
                            <span className="text-slate-700 font-black">-</span>
                            <input type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} onClick={(e) => e.target.showPicker?.()} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer [color-scheme:dark]" />
                        </div>
                    </div>

                    {/* 2. Urutan */}
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <ArrowUpDown size={14} className="text-amber-500 shrink-0" />
                        <select value={`${filters.sort_by}-${filters.sort_order}`} onChange={e => {
                            const [by, ord] = e.target.value.split('-');
                            setFilters({...filters, sort_by: by, sort_order: ord});
                        }} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="date-desc">Terbaru</option>
                            <option value="amount-desc">Terbesar</option>
                            <option value="amount-asc">Terkecil</option>
                        </select>
                    </div>

                    {/* 3. Filter Dompet */}
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Wallet size={14} className="text-amber-500 shrink-0" />
                        <select value={filters.financial_account_id} onChange={e => setFilters({...filters, financial_account_id: e.target.value})} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="">Semua Portofolio</option>
                            {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* BARIS BAWAH (4, 5, 6, 7) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* 4. Filter Kategori */}
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Tag size={14} className="text-amber-500 shrink-0" />
                        <select value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="">Kategori</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* 5. Filter Jenis (Masuk/Keluar) */}
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Filter size={14} className="text-amber-500 shrink-0" />
                        <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="">Semua Aliran</option>
                            <option value="income">Masuk</option>
                            <option value="expense">Keluar</option>
                        </select>
                    </div>

                    {/* 6. Reset Button */}
                    <button onClick={handleReset} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white p-3 rounded-2xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95">
                        <RefreshCcw size={12} /> Reset
                    </button>

                    {/* 7. + Kategori Button */}
                    <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-900 p-3 rounded-2xl border border-amber-500/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-amber-500/5">
                        <Plus size={14} /> Kategori
                    </button>
                </div>
            </div>

            {/* LIST TRANSAKSI */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Menyinkronkan Portofolio...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {transactions.map((trx) => (
                            <div key={trx.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.03] transition-all group gap-4">
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl ${trx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {trx.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownLeft size={20}/>}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-sm font-black text-white uppercase group-hover:text-amber-500 transition-colors">{trx.category?.name || 'Lainnya'}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                                            {trx.financial_account?.name} • {new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-[11px] text-slate-600 italic mt-1 truncate max-w-[200px] md:max-w-xs">{trx.description || '-'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between md:justify-end gap-6">
                                    <p className={`text-lg font-black italic ${trx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {trx.type === 'income' ? '+' : '-'} Rp {parseFloat(trx.amount).toLocaleString('id-ID')}
                                    </p>
                                    
                                    <div className="flex flex-row md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditClick(trx)} className="p-2 bg-white/5 hover:bg-amber-500 hover:text-slate-900 rounded-lg text-slate-500 transition-all">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(trx.id)} className="p-2 bg-white/5 hover:bg-rose-500 hover:text-white rounded-lg text-slate-500 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="p-20 text-center text-slate-600 font-black uppercase text-[10px] tracking-[0.4em] italic">
                                Belum ada catatan aliran dana
                            </div>
                        )}
                    </div>
                )}
            </div>

            <TransactionModal isOpen={isEditModalOpen} onClose={() => {setIsEditModalOpen(false); setSelectedTransaction(null);}} onSuccess={fetchData} wallets={wallets} editData={selectedTransaction} />
            <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSuccess={fetchMaster} />
        </div>
    );
};

export default Transactions;