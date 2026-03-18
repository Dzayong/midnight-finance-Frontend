import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check, Plus, Edit3, Loader2 } from 'lucide-react';
import { GoldButton } from '../ui/Button';

const TransactionModal = ({ isOpen, onClose, onSuccess, wallets, editData = null }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        type: 'expense', amount: '', category_id: '', financial_account_id: '', 
        date: new Date().toISOString().split('T')[0], description: ''
    });

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // Sinkronisasi Form saat Modal Buka (Mode Tambah vs Edit)
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                // Jika ada data yang mau diedit, masukkan ke form
                setForm({
                    type: editData.type,
                    amount: editData.amount,
                    category_id: editData.category_id,
                    financial_account_id: editData.financial_account_id,
                    date: editData.date,
                    description: editData.description || ''
                });
            } else {
                // Jika tambah baru, reset form ke awal
                setForm({
                    type: 'expense', amount: '', category_id: '', financial_account_id: '', 
                    date: new Date().toISOString().split('T')[0], description: ''
                });
            }
            fetchCategories();
        }
    }, [isOpen, editData]);

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${baseURL}/categories`, { headers: { Authorization: `Bearer ${token}` } });
            setCategories(res.data.data || res.data);
        } catch (err) { console.error("Gagal ambil kategori", err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            if (editData) {
                // MODE EDIT: Tembak pake PUT
                await axios.put(`${baseURL}/transactions/${editData.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                // MODE TAMBAH: Tembak pake POST
                await axios.post(`${baseURL}/transactions`, form, { headers: { Authorization: `Bearer ${token}` } });
            }
            
            onSuccess(); 
            onClose();
        } catch (err) { 
            alert(editData ? "Gagal update transaksi!" : "Gagal catat transaksi!"); 
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in duration-300 text-left">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black italic text-white tracking-widest uppercase flex items-center gap-3">
                        {editData ? <Edit3 className="text-amber-500"/> : <Plus className="text-amber-500"/>}
                        {editData ? 'Koreksi Aliran Dana' : 'Catat Aliran Dana'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl">
                        <button type="button" onClick={() => setForm({...form, type: 'expense', category_id: ''})} className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${form.type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500'}`}>Keluar</button>
                        <button type="button" onClick={() => setForm({...form, type: 'income', category_id: ''})} className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${form.type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>Masuk</button>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nominal (Rp)</label>
                            <input type="number" required value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full bg-transparent border-b-2 border-white/10 py-4 text-5xl font-black text-amber-500 outline-none focus:border-amber-500 transition-all text-center italic" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Portofolio</label>
                                <select required value={form.financial_account_id} onChange={(e) => setForm({...form, financial_account_id: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-[11px] font-bold uppercase text-white">
                                    <option value="" className="bg-slate-900">-- Pilih --</option>
                                    {wallets.map(w => <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Kategori</label>
                                <select required value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-[11px] font-bold uppercase text-white">
                                    <option value="" className="bg-slate-900">-- Pilih --</option>
                                    {categories.filter(c => c.type === form.type).map(cat => <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Catatan</label>
                            <input type="text" placeholder="Catatan..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs text-white" />
                        </div>
                    </div>

                    <GoldButton className="w-full py-5" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={18}/> : <><Check size={18}/> {editData ? 'Perbarui Brankas' : 'Simpan Ke Brankas'}</>}
                    </GoldButton>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;