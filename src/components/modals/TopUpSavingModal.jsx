import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, PiggyBank, Check, Loader2, Wallet } from 'lucide-react';
import { GoldButton } from '../ui/Button';
import Swal from 'sweetalert2';

const TopUpSavingModal = ({ isOpen, onClose, onSuccess, wallets, savingData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [displayAmount, setDisplayAmount] = useState('');
    const [amount, setAmount] = useState(0);

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!isOpen) {
            setDisplayAmount('');
            setAmount(0);
        }
    }, [isOpen]);

    const formatCurrency = (value) => {
        if (!value) return '';
        const rawValue = value.toString().replace(/\D/g, ''); 
        if (!rawValue) return '';
        return parseInt(rawValue, 10).toLocaleString('id-ID'); 
    };

    const handleChange = (e) => {
        const formatted = formatCurrency(e.target.value);
        setDisplayAmount(formatted);
        setAmount(Number(e.target.value.replace(/\D/g, '')));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (amount <= 0) return;

        // Cek Saldo Dompet Asal
        const sourceWallet = wallets.find(w => w.id === savingData?.financial_account_id);
        if (sourceWallet && amount > Number(sourceWallet.balance)) {
            return Swal.fire({
                title: 'SALDO KURANG',
                text: `Brankas ${sourceWallet.name} cuma sisa Rp ${Math.floor(sourceWallet.balance).toLocaleString('id-ID')}.`,
                icon: 'warning', background: '#0f172a', color: '#fff', confirmButtonColor: '#f59e0b'
            });
        }

        // Cek apakah Top Up melebihi sisa target
        const sisaTarget = Number(savingData.target_amount) - Number(savingData.current_amount);
        if (amount > sisaTarget) {
            return Swal.fire({
                title: 'KELEBIHAN TARGET',
                text: `Target kurang Rp ${sisaTarget.toLocaleString('id-ID')} lagi. Jangan setor kebanyakan, Sultan!`,
                icon: 'info', background: '#0f172a', color: '#fff', confirmButtonColor: '#3b82f6'
            });
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // Logika Dewa: Tambahkan uang inputan dengan uang yang sudah ada
        const newTotalAmount = Number(savingData.current_amount) + amount;

        try {
            await axios.put(`${baseURL}/savings/${savingData.id}`, {
                name: savingData.name,
                target_amount: savingData.target_amount,
                current_amount: newTotalAmount, // Uang baru hasil penjumlahan
                deadline: savingData.deadline
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            Swal.fire({
                title: 'BERHASIL MASUK!',
                text: `Dana Rp ${amount.toLocaleString('id-ID')} berhasil ditambahkan ke target ${savingData.name}.`,
                icon: 'success', background: '#0f172a', color: '#fff', confirmButtonColor: '#10b981',
                showConfirmButton: false, timer: 2000
            });

            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire({ title: 'GAGAL', text: 'Gagal menyetor dana.', icon: 'error', background: '#0f172a', color: '#fff' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !savingData) return null;

    const sourceWallet = wallets.find(w => w.id === savingData.financial_account_id);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-sm p-6 md:p-8 shadow-2xl relative text-left">
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black italic text-white tracking-widest uppercase flex items-center gap-3">
                        <PiggyBank className="text-emerald-500"/> Nabung Dulu
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Impian</p>
                            <h3 className="text-sm font-black text-white uppercase truncate max-w-[150px]">{savingData.name}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sumber Brankas</p>
                            <p className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1 justify-end"><Wallet size={12}/> {sourceWallet?.name || '-'}</p>
                        </div>
                    </div>

                    <div className="text-center bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/20 relative">
                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Setor Berapa Hari Ini?</label>
                        <div className="flex items-center justify-center gap-2 border-b-2 border-emerald-500/30 pb-2">
                            <span className="text-xl font-black text-emerald-500/50 italic">Rp</span>
                            <input 
                                type="text" 
                                required 
                                autoFocus
                                placeholder="0" 
                                value={displayAmount} 
                                onChange={handleChange} 
                                className="w-full bg-transparent py-1 text-3xl font-black text-emerald-500 outline-none text-center italic tracking-tighter" 
                            />
                        </div>
                    </div>

                    <GoldButton className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white" disabled={isLoading || amount === 0}>
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18}/> SETORKAN DANA</>}
                    </GoldButton>
                </form>
            </div>
        </div>
    );
};

export default TopUpSavingModal;