import React, { useState } from 'react';
import axios from 'axios';
import { X, Check, Tag, Loader2 } from 'lucide-react';
import { GoldButton } from '../ui/Button';

const CategoryModal = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', type: 'expense' });
    const [isLoading, setIsLoading] = useState(false);
    
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${baseURL}/categories`, form, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            onSuccess(); // Refresh list kategori di background
            onClose();   // Tutup modal
            setForm({ name: '', type: 'expense' }); // Reset form
        } catch (err) { 
            alert("Gagal menambahkan kategori. Pastikan nama unik!"); 
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative text-left">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black italic text-white tracking-widest uppercase flex items-center gap-3">
                        <Tag className="text-amber-500" size={20}/> Kategori Baru
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selector Tipe */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                        <button 
                            type="button" 
                            onClick={() => setForm({...form, type: 'expense'})} 
                            className={`py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${form.type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500'}`}
                        >
                            Pengeluaran
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setForm({...form, type: 'income'})} 
                            className={`py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${form.type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}
                        >
                            Pemasukan
                        </button>
                    </div>

                    {/* Input Nama */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-2 tracking-widest italic">Nama Kategori</label>
                        <input 
                            autoFocus 
                            type="text" 
                            required 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})} 
                            placeholder="Misal: Makan, Gaji, Investasi..." 
                            className="w-full bg-slate-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs font-bold text-white uppercase placeholder:text-slate-700 transition-all" 
                        />
                    </div>

                    {/* Submit */}
                    <GoldButton className="w-full py-4 shadow-amber-500/10" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={18}/> : <><Check size={18}/> Tambahkan</>}
                    </GoldButton>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;