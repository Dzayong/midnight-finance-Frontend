import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ArrowRightLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { GoldButton } from '../ui/Button';

const TransferModal = ({ isOpen, onClose, onSuccess, wallets }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        from_account_id: '', to_account_id: '', amount: '', 
        admin_fee: 0, admin_fee_category_id: '',
        date: new Date().toISOString().split('T')[0], description: ''
    });

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                const token = localStorage.getItem('token');
                try {
                    const res = await axios.get(`${baseURL}/categories`, { headers: { Authorization: `Bearer ${token}` } });
                    // Filter kategori 'expense' saja untuk biaya admin
                    const list = res.data.data || res.data;
                    setCategories(list.filter(c => c.type === 'expense'));
                } catch (err) { console.error(err); }
            };
            fetchCategories();
        }
    }, [isOpen, baseURL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${baseURL}/transfers`, form, { headers: { Authorization: `Bearer ${token}` } });
            onSuccess();
            onClose();
            setForm({ ...form, amount: '', admin_fee: 0, description: '' });
        } catch (err) {
            alert(err.response?.data?.message || "Transfer gagal!");
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
                        <ArrowRightLeft className="text-amber-500"/> Pindah Dana
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Dari Dompet</label>
                            <select required value={form.from_account_id} onChange={(e) => setForm({...form, from_account_id: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-[11px] font-bold uppercase text-white">
                                <option value="" className="bg-slate-900">-- Pilih Asal --</option>
                                {wallets.map(w => <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Ke Dompet</label>
                            <select required value={form.to_account_id} onChange={(e) => setForm({...form, to_account_id: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-[11px] font-bold uppercase text-white">
                                <option value="" className="bg-slate-900">-- Pilih Tujuan --</option>
                                {wallets.map(w => <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="text-center bg-white/5 p-6 rounded-[2rem] border border-white/5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Nominal Transfer</label>
                        <input type="number" placeholder="0" required value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full bg-transparent py-2 text-4xl font-black text-amber-500 outline-none text-center italic" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Biaya Admin (Rp)</label>
                            <input type="number" value={form.admin_fee} onChange={(e) => setForm({...form, admin_fee: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Kategori Admin</label>
                            <select required={form.admin_fee > 0} value={form.admin_fee_category_id} onChange={(e) => setForm({...form, admin_fee_category_id: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-[11px] font-bold uppercase text-white disabled:opacity-30" disabled={!form.admin_fee || form.admin_fee <= 0}>
                                <option value="" className="bg-slate-900">-- Pilih --</option>
                                {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Catatan</label>
                        <input type="text" placeholder="Misal: Top up e-wallet..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs text-white" />
                    </div>

                    <GoldButton className="w-full py-5" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18}/> Eksekusi Transfer</>}
                    </GoldButton>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;