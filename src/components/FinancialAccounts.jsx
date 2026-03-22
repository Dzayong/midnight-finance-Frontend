import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Wallet, Landmark, CreditCard, ArrowRightLeft, Target, Trash2, Edit3, Calendar, CheckCircle2, XCircle, PiggyBank } from 'lucide-react';
import { GoldButton } from './ui/Button';
import AccountModal from './modals/AccountModal';
import TransferModal from './modals/TransferModal';
import SavingModal from './modals/SavingModal';
import TopUpSavingModal from './modals/TopUpSavingModal'; // 💡 IMPORT MODAL TOP UP BARU!
import Swal from 'sweetalert2';

const FinancialAccounts = () => {
    const [activeTab, setActiveTab] = useState('aset'); 
    const [wallets, setWallets] = useState([]);
    const [savings, setSavings] = useState([]); 
    
    const [isLoading, setIsLoading] = useState(true);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    
    const [isSavingModalOpen, setIsSavingModalOpen] = useState(false); 
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false); // 💡 STATE MODAL TOP UP
    const [selectedSaving, setSelectedSaving] = useState(null); 

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Kita coba tarik dua-duanya
            const [resWallets, resSavings] = await Promise.allSettled([
                axios.get(`${baseURL}/financial-accounts`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${baseURL}/savings`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (resWallets.status === 'fulfilled') {
                setWallets(resWallets.value.data.data || resWallets.value.data || []);
            } else {
                console.error("Gagal muat dompet:", resWallets.reason);
            }

            if (resSavings.status === 'fulfilled') {
                setSavings(resSavings.value.data.data || resSavings.value.data || []);
            } else {
                console.error("Gagal muat tabungan:", resSavings.reason);
            }
        } catch (globalErr) {
            console.error("Error fatal sistem:", globalErr);
        } finally { 
            setIsLoading(false); 
        }
    }, [baseURL, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getIcon = (type) => {
        switch(type) {
            case 'bank': return <Landmark className="text-blue-400" size={18} />;
            case 'ewallet': return <CreditCard className="text-purple-400" size={18} />;
            default: return <Wallet className="text-amber-500" size={18} />;
        }
    };

    // FUNGSI AKSI TABUNGAN (SELESAI / BATAL)
    const handleActionSaving = async (id, name, status) => {
        let swalConfig = {};

        if (status === 'completed') {
            swalConfig = {
                title: 'TARGET TERCAPAI! 🎉',
                html: `Tabungan <b>${name}</b> akan dicairkan ke brankas.<br><br><span style="color:#f59e0b; font-size:12px; font-weight:bold;">⚠️ PENTING: Jangan lupa catat transaksi aslinya di menu Dashboard setelah ini!</span>`,
                icon: 'success', showCancelButton: true, background: '#0f172a', color: '#fff', confirmButtonColor: '#10b981', cancelButtonColor: '#334155', confirmButtonText: 'Ya, Cairkan & Beli!', cancelButtonText: 'Nanti Dulu'
            };
        } else {
            swalConfig = {
                title: 'KEPEPET / BATAL?',
                text: `Tabungan "${name}" akan dihapus. Uang terkumpul akan dikembalikan ke brankas utama.`,
                icon: 'warning', showCancelButton: true, background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444', cancelButtonColor: '#334155', confirmButtonText: 'Ya, Cairkan Darurat', cancelButtonText: 'Batal'
            };
        }

        const result = await Swal.fire(swalConfig);

        if (result.isConfirmed) {
            try {
                await axios.delete(`${baseURL}/savings/${id}?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
                
                if (status === 'completed') {
                    Swal.fire({ title: 'CAIR!', text: 'Uang sudah masuk ke dompet. Silakan buka menu Dashboard untuk mencatat pengeluaran belanjamu!', icon: 'info', background: '#0f172a', color: '#fff', confirmButtonColor: '#f59e0b' });
                } else {
                    Swal.fire({ title: 'DIBATALKAN', text: 'Uang aman dikembalikan ke brankas.', icon: 'success', background: '#0f172a', color: '#fff', confirmButtonColor: '#10b981', timer: 1500, showConfirmButton: false });
                }
                
                fetchData(); 
            } catch (err) {
                Swal.fire({ title: 'GAGAL', text: 'Sistem gagal memproses.', icon: 'error', background: '#0f172a', color: '#fff' });
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Portofolio Keuangan</h1>
                    <div className="flex gap-2 mt-4 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit shadow-inner">
                        <button onClick={() => setActiveTab('aset')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'aset' ? 'bg-amber-500 text-slate-900 shadow-lg scale-100' : 'text-slate-500 hover:text-slate-300 scale-95'}`}>Aset Brankas</button>
                        <button onClick={() => setActiveTab('impian')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'impian' ? 'bg-amber-500 text-slate-900 shadow-lg scale-100' : 'text-slate-500 hover:text-slate-300 scale-95'}`}>Target Impian</button>
                    </div>
                </div>

                <div className="flex gap-2">
                    {activeTab === 'aset' ? (
                        <>
                            <button onClick={() => setIsTransferModalOpen(true)} className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"><ArrowRightLeft size={14} className="text-amber-500" /> Transfer</button>
                            <GoldButton onClick={() => setIsAccountModalOpen(true)} className="py-3 px-4 text-[9px] active:scale-95"><Plus size={14} /> Dompet Baru</GoldButton>
                        </>
                    ) : (
                        <GoldButton onClick={() => { setSelectedSaving(null); setIsSavingModalOpen(true); }} className="py-3 px-4 text-[9px] active:scale-95"><Plus size={14} /> Target Baru</GoldButton>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"></div>)}
                </div>
            ) : (
                <>
                    {/* --- TAB ASET BRANKAS --- */}
                    {activeTab === 'aset' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-left-4 fade-in duration-500">
                            {wallets.map((wallet) => (
                                <div key={wallet.id} className="group bg-slate-900/40 border border-white/5 hover:border-amber-500/30 p-5 rounded-3xl transition-all duration-300 shadow-xl relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="p-2.5 bg-slate-950/50 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">{getIcon(wallet.type)}</div>
                                        <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter border border-white/5 px-2 py-0.5 rounded-full group-hover:text-amber-500 transition-colors">{wallet.type}</span>
                                    </div>
                                    <div className="relative z-10 space-y-0.5">
                                        <h3 className="text-slate-500 text-[9px] font-bold uppercase truncate pr-2" title={wallet.name}>{wallet.name}</h3>
                                        <p className="text-lg font-black text-white italic tracking-tighter"><span className="text-[10px] mr-1 not-italic font-medium text-slate-500">Rp</span>{Math.floor(Number(wallet.balance)).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
                                </div>
                            ))}
                            {wallets.length === 0 && <div className="col-span-full py-16 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[2.5rem]"><p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] italic">Belum ada aset terdaftar</p></div>}
                        </div>
                    )}

                    {/* --- TAB TARGET IMPIAN --- */}
                    {activeTab === 'impian' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 fade-in duration-500">
                            {savings.map((save) => {
                                const pct = save.target_amount > 0 ? Math.min(100, Math.round((save.current_amount / save.target_amount) * 100)) : 0;
                                
                                return (
                                    <div key={save.id} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                                        
                                        {/* 💡 THE 4 BUTTONS ACTION */}
                                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-slate-950/80 backdrop-blur-sm p-1.5 rounded-2xl border border-white/5">
                                            
                                            {/* 1. Tombol Selesai (Hanya muncul jika 100%) */}
                                            {pct >= 100 && (
                                                <button onClick={() => handleActionSaving(save.id, save.name, 'completed')} title="Target Tercapai! Cairkan" className="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all animate-pulse">
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}

                                            {/* 2. Tombol Top Up / Nyicil (CELENGAN) */}
                                            <button onClick={() => { setSelectedSaving(save); setIsTopUpModalOpen(true); }} title="Setor Dana / Nyicil" className="p-1.5 text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all">
                                                <PiggyBank size={16} />
                                            </button>
                                            
                                            {/* 3. Tombol Edit Info Tabungan */}
                                            <button onClick={() => { setSelectedSaving(save); setIsSavingModalOpen(true); }} title="Revisi Info Target" className="p-1.5 text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all">
                                                <Edit3 size={16} />
                                            </button>
                                            
                                            {/* 4. Tombol Kepepet / Batal */}
                                            <button onClick={() => handleActionSaving(save.id, save.name, 'canceled')} title="Kepepet / Batalkan" className="p-1.5 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                                                <XCircle size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><Target size={20} /></div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase italic tracking-wide truncate max-w-[200px]" title={save.name}>{save.name}</h3>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5"><Wallet size={10} className="text-slate-600"/> {save.financial_account?.name || 'Dompet Terhapus'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-amber-500">{pct}% Terkumpul</span>
                                                <span className="text-slate-500 font-mono">Rp {Math.floor(save.target_amount).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                                                <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full relative" style={{ width: `${pct}%`, transition: 'width 1s ease-in-out' }}>
                                                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]"></div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 text-right font-mono">Rp {Math.floor(save.current_amount).toLocaleString('id-ID')} / Rp {Math.floor(save.target_amount).toLocaleString('id-ID')}</p>
                                        </div>

                                        {save.deadline ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Calendar size={12} className="text-emerald-500" /> Tenggat: <span className="text-white">{new Date(save.deadline).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span></div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-bold text-slate-500 uppercase tracking-widest"><Calendar size={12} className="opacity-50" /> Tanpa Tenggat</div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {savings.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                    <Target size={32} className="mx-auto text-slate-700 mb-4 opacity-50" />
                                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">Belum ada target impian yang dibuat</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* MODALS RENDER */}
            <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSuccess={fetchData} />
            <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} onSuccess={fetchData} wallets={wallets} />
            <SavingModal isOpen={isSavingModalOpen} onClose={() => { setIsSavingModalOpen(false); setSelectedSaving(null); }} onSuccess={fetchData} wallets={wallets} editData={selectedSaving} />
            
            {/* 💡 MODAL TOP UP RENDER */}
            <TopUpSavingModal 
                isOpen={isTopUpModalOpen} 
                onClose={() => { setIsTopUpModalOpen(false); setSelectedSaving(null); }} 
                onSuccess={fetchData} 
                wallets={wallets} 
                savingData={selectedSaving} 
            />
        </div>
    );
};

export default FinancialAccounts;