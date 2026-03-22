import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Target, Check, Loader2, Wallet, Calendar, AlertCircle, Edit3 } from 'lucide-react';
import { GoldButton } from '../ui/Button';
import Swal from 'sweetalert2';

const SavingModal = ({ isOpen, onClose, onSuccess, wallets = [], editData = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // State Tampilan Layar (Format Rupiah)
    const [displayTarget, setDisplayTarget] = useState('');
    const [displayCurrent, setDisplayCurrent] = useState('');

    // State Data Murni
    const [form, setForm] = useState({
        financial_account_id: '',
        name: '',
        target_amount: '',
        current_amount: '',
        deadline: ''
    });

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // Fungsi Format Rupiah & Pemotong Desimal (The Sultan's Trim)
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '';
        const rawValue = value.toString().replace(/\D/g, ''); 
        if (!rawValue) return '';
        return parseInt(rawValue, 10).toLocaleString('id-ID'); 
    };

    useEffect(() => {
        if (!isOpen) {
            setForm({ financial_account_id: '', name: '', target_amount: '', current_amount: '', deadline: '' });
            setDisplayTarget('');
            setDisplayCurrent('');
        } else if (editData && isOpen) {
            // MODE EDIT
            const cleanTarget = Math.floor(Number(editData.target_amount)).toString();
            const cleanCurrent = Math.floor(Number(editData.current_amount)).toString();

            setForm({
                financial_account_id: editData.financial_account_id || '',
                name: editData.name || '',
                target_amount: cleanTarget,
                current_amount: cleanCurrent,
                deadline: editData.deadline ? editData.deadline.split(' ')[0] : ''
            });
            
            setDisplayTarget(formatCurrency(cleanTarget));
            setDisplayCurrent(formatCurrency(cleanCurrent));
        }
    }, [isOpen, editData]);

    const handleTargetChange = (e) => {
        const formatted = formatCurrency(e.target.value);
        setDisplayTarget(formatted);
        setForm({ ...form, target_amount: e.target.value.replace(/\D/g, '') });
    };

    const handleCurrentChange = (e) => {
        const formatted = formatCurrency(e.target.value);
        setDisplayCurrent(formatted);
        setForm({ ...form, current_amount: e.target.value.replace(/\D/g, '') });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            ...form,
            target_amount: Number(form.target_amount),
            current_amount: form.current_amount ? Number(form.current_amount) : 0,
            deadline: form.deadline || null
        };

        // Frontend Validation untuk Cek Saldo (Hanya saat Bikin Baru)
        if (!editData && payload.current_amount > 0) {
            const selectedWallet = wallets.find(w => w.id.toString() === form.financial_account_id.toString());
            if (selectedWallet && payload.current_amount > Number(selectedWallet.balance)) {
                return Swal.fire({
                    title: 'SALDO KURANG',
                    text: `Brankas ${selectedWallet.name} tidak memiliki cukup saldo untuk alokasi awal ini.`,
                    icon: 'warning',
                    background: '#0f172a', color: '#fff', confirmButtonColor: '#f59e0b'
                });
            }
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            if (editData) {
                await axios.put(`${baseURL}/savings/${editData.id}`, payload, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                await axios.post(`${baseURL}/savings`, payload, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
            }

            Swal.fire({
                title: 'BERHASIL',
                text: editData ? 'Target impian berhasil direvisi!' : 'Target impian baru berhasil dibuat!',
                icon: 'success',
                background: '#0f172a', color: '#fff', confirmButtonColor: '#10b981',
                showConfirmButton: false, timer: 1500
            });

            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire({
                title: 'GAGAL',
                text: err.response?.data?.message || `Target gagal di${editData ? 'edit' : 'eksekusi'}!`,
                icon: 'error',
                background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black italic text-white tracking-widest uppercase flex items-center gap-3">
                        {editData ? <Edit3 className="text-amber-500"/> : <Target className="text-amber-500"/>} 
                        {editData ? 'Revisi Impian' : 'Target Impian Baru'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"><X size={20}/></button>
                </div>

                {editData && (
                    <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 items-start">
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">
                            <span className="font-black">MODE REVISI:</span> Sumber brankas telah dikunci. Menambah 'Uang Terkumpul' akan memotong saldo brankas, menguranginya akan mengembalikan saldo.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SUMBER DANA & NAMA TARGET */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-1.5"><Wallet size={10}/> Dari Brankas</label>
                            <select 
                                required 
                                disabled={!!editData} 
                                value={form.financial_account_id} 
                                onChange={(e) => setForm({...form, financial_account_id: e.target.value})} 
                                className={`w-full border p-4 rounded-2xl outline-none text-[11px] font-bold uppercase text-white ${editData ? 'bg-slate-950/50 border-white/5 opacity-50 cursor-not-allowed' : 'bg-white/5 border-white/10 focus:border-amber-500'}`}
                            >
                                <option value="" disabled className="bg-slate-900 text-slate-500">-- Pilih Sumber --</option>
                                {/* 💡 PENGAMAN RENDER WALLET */}
                                {wallets?.map(w => (
                                    <option key={w.id} value={w.id} className="bg-slate-900">
                                        {w.name} (Rp {Math.floor(Number(w.balance || 0)).toLocaleString('id-ID')})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Nama Impian</label>
                            <input 
                                type="text" 
                                required
                                value={form.name} 
                                onChange={(e) => setForm({...form, name: e.target.value})} 
                                placeholder="Misal: Laptop Advan Workplus"  // 💡 LOKAL PRIDE!
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs font-bold text-white uppercase placeholder:normal-case placeholder:font-normal" 
                            />
                        </div>
                    </div>

                    {/* TARGET AMOUNT (NOMINAL BESAR) */}
                    <div className="text-center bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner relative">
                        <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-2">Berapa Target Uangnya?</label>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-black text-amber-500/50 italic">Rp</span>
                            <input 
                                type="text" 
                                required 
                                placeholder="0" 
                                value={displayTarget} 
                                onChange={handleTargetChange} 
                                className="w-3/4 bg-transparent py-2 text-4xl md:text-5xl font-black text-amber-500 outline-none text-center italic tracking-tighter" 
                            />
                        </div>
                    </div>

                    {/* CURRENT AMOUNT & DEADLINE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest flex justify-between">
                                <span>Telah Terkumpul</span>
                                {!editData && <span className="text-emerald-500 opacity-70 border-b border-emerald-500/30">Otomatis potong brankas</span>}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">Rp</span>
                                <input 
                                    type="text" 
                                    value={displayCurrent} 
                                    onChange={handleCurrentChange} 
                                    placeholder="0 (Boleh kosong)" 
                                    className="w-full bg-slate-950 border border-white/10 pl-10 pr-4 py-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-black text-emerald-500 transition-all" 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-1.5"><Calendar size={10}/> Deadline (Opsional)</label>
                            <input 
                                type="date" 
                                value={form.deadline} 
                                min={new Date().toISOString().split('T')[0]} 
                                onChange={(e) => setForm({...form, deadline: e.target.value})} 
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs font-bold text-white [color-scheme:dark]" 
                            />
                        </div>
                    </div>

                    <GoldButton className="w-full py-5 rounded-2xl" disabled={isLoading || !form.target_amount || Number(form.target_amount) === 0}>
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18}/> {editData ? 'SIMPAN REVISI' : 'BUAT TARGET IMPIAN'}</>}
                    </GoldButton>
                </form>
            </div>
        </div>
    );
};

export default SavingModal;