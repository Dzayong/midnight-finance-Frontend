import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ArrowRightLeft, Check, Loader2, ShieldCheck, Landmark, Edit3 } from 'lucide-react';
import { GoldButton } from '../ui/Button';
import Swal from 'sweetalert2';

// 💡 TAMBAHKAN PROPS editData
const TransferModal = ({ isOpen, onClose, onSuccess, wallets, editData = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    const [displayAmount, setDisplayAmount] = useState('');
    const [displayAdminFee, setDisplayAdminFee] = useState('');
    const [isFreeAdmin, setIsFreeAdmin] = useState(true);

    const [form, setForm] = useState({
        from_account_id: '', 
        to_account_id: '', 
        amount: '', 
        admin_fee: 0, 
        date: today, 
        description: ''
    });

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // 💡 SULAP DATA: Ekstrak dompet asal & tujuan dari deskripsi Backend (jika mode edit)
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '';
        const rawValue = value.toString().replace(/\D/g, ''); 
        if (!rawValue) return '';
        return parseInt(rawValue, 10).toLocaleString('id-ID'); 
    };

    useEffect(() => {
        if (!isOpen) {
            setForm({ from_account_id: '', to_account_id: '', amount: '', admin_fee: 0, date: today, description: '' });
            setDisplayAmount('');
            setDisplayAdminFee('');
            setIsFreeAdmin(true);
        } else if (editData && isOpen) {
            // MODE EDIT: Load data lama
            const desc = editData.description || '';
            let rawDesc = desc;
            
            // Bersihkan teks KELUAR/MASUK dari Backend untuk form
            if (desc.includes('Transfer Keluar ke')) {
                rawDesc = desc.replace(/Transfer Keluar ke .*? - /, '').replace(/Transfer Keluar ke [^-]+$/, '');
            } else if (desc.includes('Transfer Masuk dari')) {
                rawDesc = desc.replace(/Transfer Masuk dari .*? - /, '').replace(/Transfer Masuk dari [^-]+$/, '');
            }

            const cleanAmount = Math.floor(Number(editData.amount)).toString();

            // Set Form
            setForm({
                // Saat mode edit, karena kita belum menyimpan from_id dan to_id mentah di tabel transaksi,
                // kita asumsikan dompet yang sedang dilihat adalah asalnya (ini akan dikunci nanti)
                from_account_id: editData.financial_account_id || '', 
                to_account_id: '', // Dikosongkan karena tidak bisa diubah di mode edit (tergembok)
                amount: cleanAmount,
                admin_fee: 0, // Admin fee di reset karena ini hanya ngedit transaksi transfer intinya
                date: editData.date.split(' ')[0], 
                description: rawDesc.trim()
            });
            
            setDisplayAmount(formatCurrency(cleanAmount));
            setDisplayAdminFee('');
            setIsFreeAdmin(true);
        }
    }, [isOpen, editData, today]);

    const handleAmountChange = (e) => {
        const formatted = formatCurrency(e.target.value);
        setDisplayAmount(formatted);
        setForm({ ...form, amount: e.target.value.replace(/\D/g, '') });
    };

    const handleAdminFeeChange = (e) => {
        const formatted = formatCurrency(e.target.value);
        setDisplayAdminFee(formatted);
        setForm({ ...form, admin_fee: e.target.value.replace(/\D/g, '') });
    };

    const toggleAdminFee = () => {
        if (editData) return; // Mode Edit gak bisa ubah status admin fee lama
        const newStatus = !isFreeAdmin;
        setIsFreeAdmin(newStatus);
        if (newStatus) { 
            setDisplayAdminFee('');
            setForm({ ...form, admin_fee: 0 });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Cek hanya jika Mode Baru
        if (!editData && form.from_account_id === form.to_account_id) {
            return Swal.fire({
                title: 'TRANSAKSI DITOLAK',
                text: 'Asal dan tujuan brankas tidak boleh sama, Bang!',
                icon: 'warning',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#f59e0b'
            });
        }

        const payload = {
            ...form,
            amount: Number(form.amount),
            admin_fee: isFreeAdmin ? 0 : Number(form.admin_fee)
        };

        // Jika mode edit, to_account_id kita bypass ke Backend dengan ID yang sama agar bisa lolos validasi (nanti Backend yang urus siblings-nya)
        if (editData) {
            payload.from_account_id = editData.financial_account_id;
            // Kita akali kirim dummy ke tujuan supaya lolos validasi request Laravel (karena dompet tujuan dibaca dari siblings database)
            const dummyTarget = wallets.find(w => w.id !== editData.financial_account_id);
            payload.to_account_id = dummyTarget ? dummyTarget.id : editData.financial_account_id; 
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            // 💡 PINTAR: Tentukan Endpoint apakah POST (Baru) atau PUT (Edit)
            if (editData) {
                await axios.put(`${baseURL}/transfers/${editData.id}`, payload, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                await axios.post(`${baseURL}/transfers`, payload, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
            }

            Swal.fire({
                title: 'BERHASIL',
                text: editData ? 'Data transfer berhasil direvisi!' : 'Dana berhasil dipindahkan!',
                icon: 'success',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#10b981'
            });

            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire({
                title: 'GAGAL',
                text: err.response?.data?.message || `Transfer gagal di${editData ? 'edit' : 'eksekusi'}!`,
                icon: 'error',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative text-left">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black italic text-white tracking-widest uppercase flex items-center gap-3">
                        {editData ? <Edit3 className="text-amber-500"/> : <ArrowRightLeft className="text-amber-500"/>} 
                        {editData ? 'Revisi Transfer' : 'Pindah Dana'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"><X size={20}/></button>
                </div>

                {/* 💡 PESAN PERINGATAN MODE EDIT */}
                {editData && (
                    <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">
                            <span className="font-black">MODE REVISI:</span> Demi keamanan data portofolio, Anda hanya dapat mengubah nominal dan tanggal transfer. Dompet asal dan tujuan telah dikunci.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DOMPET ASAL & TUJUAN (Tergembok saat Edit) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 opacity-50 cursor-not-allowed">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Dari Brankas</label>
                            <select 
                                required 
                                disabled={!!editData} 
                                value={form.from_account_id} 
                                onChange={(e) => setForm({...form, from_account_id: e.target.value})} 
                                className="w-full bg-slate-950/50 border border-white/5 p-4 rounded-2xl outline-none text-[11px] font-bold uppercase text-slate-400"
                            >
                                <option value="" className="bg-slate-900">-- Pilih Asal --</option>
                                {wallets.map(w => <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1 opacity-50 cursor-not-allowed">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Ke Brankas</label>
                            <select 
                                required 
                                disabled={!!editData} 
                                value={form.to_account_id} 
                                onChange={(e) => setForm({...form, to_account_id: e.target.value})} 
                                className="w-full bg-slate-950/50 border border-white/5 p-4 rounded-2xl outline-none text-[11px] font-bold uppercase text-slate-400"
                            >
                                <option value="" className="bg-slate-900">{editData ? 'Terkunci (Sistem)' : '-- Pilih Tujuan --'}</option>
                                {!editData && wallets.map(w => <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="text-center bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner relative group">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nominal Transfer</label>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-black text-amber-500/50 italic">Rp</span>
                            <input 
                                type="text" 
                                placeholder="0" 
                                required 
                                value={displayAmount} 
                                onChange={handleAmountChange} 
                                className="w-3/4 bg-transparent py-2 text-5xl font-black text-amber-500 outline-none text-center italic tracking-tighter" 
                            />
                        </div>
                    </div>

                    {/* SAKLAR BIAYA ADMIN (Hilang saat Edit karena ribet ngitung balik database) */}
                    {!editData && (
                        <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-slate-950/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className={isFreeAdmin ? "text-emerald-500" : "text-slate-500"}/>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bebas Biaya Admin?</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={toggleAdminFee}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isFreeAdmin ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform duration-300 ${isFreeAdmin ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className={`transition-all duration-300 overflow-hidden ${isFreeAdmin ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                    <Landmark size={16} className="text-rose-500"/>
                                    <span className="text-sm font-black text-slate-500 italic">Rp</span>
                                    <input 
                                        type="text" 
                                        placeholder="6.500"
                                        disabled={isFreeAdmin}
                                        required={!isFreeAdmin}
                                        value={displayAdminFee} 
                                        onChange={handleAdminFeeChange} 
                                        className="w-full bg-transparent py-1 text-xl font-bold text-rose-500 outline-none border-b border-rose-500/30 focus:border-rose-500 transition-colors" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Tanggal</label>
                            <input 
                                type="date" 
                                required
                                value={form.date} 
                                max={today}
                                onChange={(e) => setForm({...form, date: e.target.value})} 
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs font-bold text-white [color-scheme:dark]" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Catatan (Opsional)</label>
                            <input type="text" placeholder="Misal: Pindah dana..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs font-bold text-white" />
                        </div>
                    </div>

                    <GoldButton className="w-full py-5 rounded-2xl" disabled={isLoading || (!form.amount || Number(form.amount) === 0)}>
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18}/> {editData ? 'SIMPAN REVISI' : 'EKSEKUSI TRANSFER'}</>}
                    </GoldButton>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;