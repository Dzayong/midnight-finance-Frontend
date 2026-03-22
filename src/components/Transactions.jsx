import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Calendar, ArrowUpDown, Wallet, Tag, 
    RefreshCcw, Edit3, Trash2, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Plus, Filter,
    CheckCircle2, XCircle, HandCoins // 👈 TAMBAH IKON DEWA DI SINI
} from 'lucide-react';
import TransactionModal from './modals/TransactionModal';
import CategoryModal from './modals/CategoryModal';
import TransferModal from './modals/TransferModal'; 
import Swal from 'sweetalert2';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false); 
    
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedTransfer, setSelectedTransfer] = useState(null); 

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
        if (trx.type === 'transfer') {
            setSelectedTransfer(trx);
            setIsTransferModalOpen(true); 
        } else {
            setSelectedTransaction(trx);
            setIsEditModalOpen(true); 
        }
    };

    const handleDelete = async (trx) => {
        // 💡 UBAH JADI SWEETALERT BIAR SULTAN
        const result = await Swal.fire({
            title: 'HAPUS TRANSAKSI?',
            text: "Transaksi ini akan dihapus permanen dan saldo akan otomatis dikembalikan ke posisi semula.",
            icon: 'warning',
            showCancelButton: true,
            background: '#0f172a',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Ya, Hapus Permanen'
        });

        if(!result.isConfirmed) return;
        
        try {
            const endpoint = trx.type === 'transfer' ? `/transfers/${trx.id}` : `/transactions/${trx.id}`;
            
            await axios.delete(`${baseURL}${endpoint}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            Swal.fire({
                title: 'TERHAPUS',
                text: 'Data berhasil dibatalkan dan saldo telah disesuaikan ulang.',
                icon: 'success',
                background: '#0f172a', color: '#fff', confirmButtonColor: '#10b981',
                showConfirmButton: false, timer: 1500
            });
            
            fetchData();
        } catch (err) { 
            Swal.fire({
                title: 'GAGAL',
                text: err.response?.data?.message || 'Terjadi kesalahan saat menghapus data.',
                icon: 'error',
                background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444'
            });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 text-left">
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Riwayat Portofolio</h1>

            {/* PANEL NAVIGASI / FILTER SULTAN */}
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Calendar size={14} className="text-amber-500 shrink-0" />
                        <div className="flex items-center gap-2 w-full">
                            <input type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} onClick={(e) => e.target.showPicker?.()} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer [color-scheme:dark]" />
                            <span className="text-slate-700 font-black">-</span>
                            <input type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} onClick={(e) => e.target.showPicker?.()} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer [color-scheme:dark]" />
                        </div>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <ArrowUpDown size={14} className="text-amber-500 shrink-0" />
                        <select value={`${filters.sort_by}-${filters.sort_order}`} onChange={e => {
                            const [by, ord] = e.target.value.split('-');
                            setFilters({...filters, sort_by: by, sort_order: ord});
                        }} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="date-desc" className="bg-slate-900">Terbaru</option>
                            <option value="amount-desc" className="bg-slate-900">Terbesar</option>
                            <option value="amount-asc" className="bg-slate-900">Terkecil</option>
                        </select>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Wallet size={14} className="text-amber-500 shrink-0" />
                        <select value={filters.financial_account_id} onChange={e => setFilters({...filters, financial_account_id: e.target.value})} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="" className="bg-slate-900">Semua Portofolio</option>
                            {wallets.map(w => <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Tag size={14} className="text-amber-500 shrink-0" />
                        <select value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="" className="bg-slate-900">Kategori</option>
                            {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                        </select>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-all">
                        <Filter size={14} className="text-amber-500 shrink-0" />
                        <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="bg-transparent text-[10px] font-bold text-white outline-none w-full uppercase cursor-pointer">
                            <option value="" className="bg-slate-900">Semua Aliran</option>
                            <option value="income" className="bg-slate-900">Pemasukan (+)</option>
                            <option value="expense" className="bg-slate-900">Pengeluaran (-)</option>
                            <option value="transfer" className="bg-slate-900">Transfer Mutasi</option>
                        </select>
                    </div>

                    <button onClick={handleReset} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white p-3 rounded-2xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95">
                        <RefreshCcw size={12} /> Reset
                    </button>

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
                        {transactions.map((trx) => {
                            let ui = { bg: 'bg-slate-500/10 text-slate-500', text: 'text-slate-400', sign: '', icon: <Tag size={20}/> };
                            const desc = trx.description ? trx.description.toUpperCase() : '';
                            
                            // 💡 LOGIKA DEWA: GANTI IKON BERDASARKAN DESKRIPSI
                            if (trx.type === 'income') {
                                if (desc.includes("TARGET TERCAPAI")) {
                                    // Selesai Nabung (Uang Cair) -> Hijau + Koin
                                    ui = { bg: 'bg-emerald-500/10 text-emerald-500', text: 'text-emerald-400', sign: '+', icon: <HandCoins size={20}/> };
                                } else if (desc.includes("BATAL/KEPEPET") || desc.includes("BATAL TARGET")) {
                                    // Batal Nabung (Uang Cair) -> Hijau (Income) + Silang (Kepepet)
                                    ui = { bg: 'bg-emerald-500/10 text-emerald-500', text: 'text-emerald-400', sign: '+', icon: <XCircle size={20}/> };
                                } else {
                                    // Income Biasa
                                    ui = { bg: 'bg-emerald-500/10 text-emerald-500', text: 'text-emerald-400', sign: '+', icon: <ArrowUpRight size={20}/> };
                                }
                            } else if (trx.type === 'expense') {
                                // PENGELUARAN (Termasuk Nabung ke Tabungan Baru)
                                ui = { bg: 'bg-rose-500/10 text-rose-500', text: 'text-rose-400', sign: '-', icon: <ArrowDownLeft size={20}/> };
                            } else if (trx.type === 'transfer') {
                                if (desc.includes('KELUAR KE TABUNGAN')) {
                                    ui = { bg: 'bg-amber-500/10 text-amber-500', text: 'text-amber-400', sign: '-', icon: <ArrowRightLeft size={20}/> };
                                } else if (desc.includes('KELUAR')) {
                                    ui = { bg: 'bg-amber-500/10 text-amber-500', text: 'text-amber-400', sign: '-', icon: <ArrowRightLeft size={20}/> };
                                } else if (desc.includes('MASUK')) {
                                    ui = { bg: 'bg-sky-500/10 text-sky-500', text: 'text-sky-400', sign: '+', icon: <ArrowRightLeft size={20}/> };
                                } else {
                                    ui = { bg: 'bg-slate-500/10 text-slate-500', text: 'text-slate-400', sign: '', icon: <ArrowRightLeft size={20}/> };
                                }
                            }

                            return (
                                <div key={trx.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.03] transition-all group gap-4 relative">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl ${ui.bg}`}>
                                            {ui.icon}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-white uppercase group-hover:text-amber-500 transition-colors">
                                                {trx.type === 'transfer' ? 'Mutasi Brankas' : (trx.category?.name || 'Lainnya')}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                                                {trx.financial_account?.name} • {new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-[11px] text-slate-600 italic mt-1 truncate max-w-[200px] md:max-w-xs">{trx.description || '-'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <p className={`text-lg font-black italic whitespace-nowrap ${ui.text}`}>
                                            {ui.sign} Rp {Math.floor(parseFloat(trx.amount)).toLocaleString('id-ID')}
                                        </p>
                                        
                                        {/* AKSI EDIT & DELETE (Tersembunyi kalau bukan di-hover) */}
                                        <div className="flex flex-row md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 md:static">
                                            <button onClick={() => handleEditClick(trx)} className="p-2 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-900 rounded-xl text-slate-500 transition-all border border-white/5">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(trx)} className="p-2 bg-slate-900/80 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all border border-white/5">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
            
            <TransferModal 
                isOpen={isTransferModalOpen} 
                onClose={() => {setIsTransferModalOpen(false); setSelectedTransfer(null);}} 
                onSuccess={fetchData} 
                wallets={wallets} 
                editData={selectedTransfer} 
            />
        </div>
    );
};

export default Transactions;