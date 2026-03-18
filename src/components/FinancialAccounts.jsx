import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Wallet, Landmark, CreditCard, ArrowRightLeft } from 'lucide-react';
import { GoldButton } from './ui/Button';
import AccountModal from './modals/AccountModal';
import TransferModal from './modals/TransferModal';

const FinancialAccounts = () => {
    const [wallets, setWallets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    const fetchWallets = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${baseURL}/financial-accounts`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setWallets(res.data.data || res.data || []);
        } catch (err) { 
            console.error("Gagal sinkronisasi portofolio", err); 
        } finally { 
            setIsLoading(false); 
        }
    }, [baseURL, token]);

    useEffect(() => { fetchWallets(); }, [fetchWallets]);

    const getIcon = (type) => {
        switch(type) {
            case 'bank': return <Landmark className="text-blue-400" size={18} />;
            case 'ewallet': return <CreditCard className="text-purple-400" size={18} />;
            default: return <Wallet className="text-amber-500" size={18} />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20 text-left">
            {/* HEADER SECTION - More Compact */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase italic">Portofolio Keuangan</h1>
                    <p className="text-[9px] text-emerald-500 font-bold tracking-[0.2em] uppercase mt-1">Aset & Alokasi Dana Aktif</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsTransferModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                        <ArrowRightLeft size={14} className="text-amber-500" /> Transfer
                    </button>
                    <GoldButton onClick={() => setIsAccountModalOpen(true)} className="py-3 px-4 text-[9px] active:scale-95">
                        <Plus size={14} /> Dompet Baru
                    </GoldButton>
                </div>
            </div>

            {/* CONTENT SECTION - Grid 4 Columns on Desktop */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wallets.map((wallet) => (
                        <div key={wallet.id} className="group bg-slate-900/40 border border-white/5 hover:border-amber-500/30 p-5 rounded-3xl transition-all duration-300 shadow-xl relative overflow-hidden">
                            {/* Top Info: Icon & Type Label */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                                    {getIcon(wallet.type)}
                                </div>
                                <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter border border-white/5 px-2 py-0.5 rounded-full group-hover:text-amber-500 group-hover:border-amber-500/30 transition-colors">
                                    {wallet.type}
                                </span>
                            </div>
                            
                            {/* Bottom Info: Name & Balance */}
                            <div className="relative z-10 space-y-0.5">
                                <h3 className="text-slate-500 text-[9px] font-bold uppercase truncate pr-2" title={wallet.name}>
                                    {wallet.name}
                                </h3>
                                <p className="text-lg font-black text-white italic tracking-tighter">
                                    <span className="text-[10px] mr-1 not-italic font-medium text-slate-500">Rp</span>
                                    {parseFloat(wallet.balance).toLocaleString('id-ID')}
                                </p>
                            </div>

                            {/* Slim Aesthetic Glow */}
                            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {wallets.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] italic">Belum ada aset terdaftar</p>
                        </div>
                    )}
                </div>
            )}

            {/* MODALS */}
            <AccountModal 
                isOpen={isAccountModalOpen} 
                onClose={() => setIsAccountModalOpen(false)} 
                onSuccess={fetchWallets} 
            />
            <TransferModal 
                isOpen={isTransferModalOpen} 
                onClose={() => setIsTransferModalOpen(false)} 
                onSuccess={fetchWallets} 
                wallets={wallets} 
            />
        </div>
    );
};

export default FinancialAccounts;