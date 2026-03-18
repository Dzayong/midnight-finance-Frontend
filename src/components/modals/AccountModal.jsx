import React, { useState } from 'react';
import axios from 'axios';
import { X, Wallet, Check, Landmark, Smartphone, Coins, TrendingUp } from 'lucide-react';
import { GoldButton } from '../ui/Button';

const AccountModal = ({ isOpen, onClose, onSuccess }) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    
    // 1. STATE MANAGEMENT
    const [form, setForm] = useState({ type: 'cash', balance: '' });
    const [selectedName, setSelectedName] = useState('');
    const [customName, setCustomName] = useState('');     
    const [isCustom, setIsCustom] = useState(false);      

    // 2. DATA REFERENSI (OJK & Populer)
    const bankList = [
        "PT Bank Central Asia (BCA)",
        "PT Bank Mandiri (Persero) (Mandiri)",
        "PT Bank Negara Indonesia (Persero) (BNI)",
        "PT Bank Rakyat Indonesia (Persero) (BRI)",
        "PT Bank Syariah Indonesia (BSI)",
        "PT Bank CIMB Niaga (CIMB Niaga)",
        "PT Bank Tabungan Negara (Persero) (BTN)",
        "PT Bank Danamon Indonesia (Danamon)",
        "PT Bank Permata (Permata)",
        "PT Bank Jago (Jago)",
        "PT Bank Seabank Indonesia (SeaBank)",
        "PT Bank Neo Commerce (BNC)",
        "PT Bank Aladin Syariah (Aladin)",
        "PT Bank Maybank Indonesia",
        "PT Bank OCBC Indonesia",
        "PT Bank Pan Indonesia (Panin Bank)",
        "PT Bank Mega",
        "PT Bank BTPN",
        "PT Bank KB Bukopin",
        "PT Bank Sinarmas",
        "PT Bank Mestika Dharma",
        "PT Bank UOB Indonesia",
        "PT Bank DBS Indonesia",
        "PT Bank HSBC Indonesia",
        "PT Bank Commonwealth",
        "PT Bank Woori Saudara Indonesia 1906",
        "PT Bank Artha Graha Internasional",
        "PT Bank Bumi Arta",
        "PT Bank Capital Indonesia",
        "PT Bank DKI",
        "PT Bank Jawa Barat dan Banten (BJB)",
        "PT Bank Jawa Tengah (Jateng)",
        "PT Bank Jawa Timur (Jatim)",
        "PT Bank Daerah Istimewa Yogyakarta (DIY)",
        "PT Bank Papua",
        "PT Bank Nagari (Sumatera Barat)",
        "PT Bank Sumatera Utara (Sumut)",
        "PT Bank Riau Kepri Syariah",
        "PT Bank Sumatera Selatan dan Bangka Belitung",
        "PT Bank Lampung",
        "PT Bank Kalimantan Barat (Kalbar)",
        "PT Bank Kalimantan Selatan (Kalsel)",
        "PT Bank Kalimantan Tengah (Kalteng)",
        "PT Bank Kalimantan Timur dan Kalimantan Utara (Kaltimtara)",
        "PT Bank Sulawesi Utara dan Gorontalo (Sulutgo)",
        "PT Bank Sulawesi Tengah (Sulteng)",
        "PT Bank Sulawesi Tenggara (Sultra)",
        "PT Bank Sulawesi Selatan dan Sulawesi Barat (Sulselbar)",
        "PT Bank Nusa Tenggara Barat Syariah (NTB Syariah)",
        "PT Bank Nusa Tenggara Timur (NTT)",
        "PT Bank Maluku dan Maluku Utara",
        "PT Bank Bali (BPD Bali)",
        "PT Bank Bengkulu",
        "PT Bank Jambi",
        "PT Bank Ganesha",
        "PT Bank Ina Perdana",
        "PT Bank Index Selindo",
        "PT Bank Jasa Jakarta",
        "PT Bank Maspion Indonesia",
        "PT Bank Mayapada Internasional",
        "PT Bank MNC Internasional",
        "PT Bank Multiarta Sentosa",
        "PT Bank Nationalnobu (Nobu Bank)",
        "PT Bank Oke Indonesia",
        "PT Bank QNB Indonesia",
        "PT Bank Resona Perdania",
        "PT Bank Sahabat Sampoerna",
        "PT Bank SBI Indonesia",
        "PT Bank Shinhan Indonesia",
        "PT Bank Standard Chartered Indonesia",
        "PT Bank Victoria Internasional",
        "PT Bank Amar Indonesia",
        "PT Bank IBK Indonesia",
        "PT Bank KEB Hana Indonesia",
        "PT Bank BNP Paribas Indonesia",
        "PT Bank China Construction Bank Indonesia",
        "PT Bank ICBC Indonesia",
        "PT Bank J Trust Indonesia",
        "PT Bank Mizuho Indonesia",
        "PT Bank Sumitomo Mitsui Indonesia",
        "PT Bank Muamalat Indonesia",
        "PT Bank Victoria Syariah",
        "PT Bank BCA Syariah",
        "PT Bank BJB Syariah",
        "PT Bank Mega Syariah",
        "PT Bank Panin Dubai Syariah",
        "PT Bank Bukopin Syariah",
        "PT Bank BTPN Syariah",
        "PT Bank Maybank Syariah Indonesia",
        "PT Bank Nano Syariah",
        "PT Bank Allo Indonesia (Allo Bank)",
        "PT Bank Digital BCA (Blu)",
        "PT Bank Superbank Indonesia",
        "PT Bank Krom Indonesia (Krom)",
        "PT Bank Fama Konfirmasi (Hibank)",
        "PT Bank Raya Indonesia",
        "PT Bank Commonwealth",
        "PT Bank Bisnis Internasional",
        "PT Bank Sri Partha",
        "PT Bank Artos Indonesia"
    ];
    
    const eWalletList = ["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja", "AstraPay", "i.Saku"];

    // 3. HANDLER
    
    // FUNGSI BARU: Ganti Tipe Akun & Reset Input (Anti-Error ESLint)
    const handleTypeChange = (newType) => {
        setForm({ ...form, type: newType });
        setSelectedName('');
        setCustomName('');
        setIsCustom(false);
    };

    const handleSelectChange = (e) => {
        const value = e.target.value;
        setSelectedName(value);
        if (value === 'Lainnya') {
            setIsCustom(true);
            setCustomName(''); 
        } else {
            setIsCustom(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        let finalName = '';
        if (form.type === 'cash' || form.type === 'investment') {
            finalName = customName; 
        } else {
            finalName = isCustom ? customName : selectedName; 
        }

        if (!finalName.trim()) {
            alert("Nama dompet tidak boleh kosong, Bang!");
            return;
        }

        try {
            await axios.post(`${baseURL}/financial-accounts`, {
                ...form,
                name: finalName
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            onSuccess(); 
            onClose();   
            // Reset Form keseluruhan setelah berhasil simpan
            setForm({ type: 'cash', balance: '' }); 
            setSelectedName('');
            setCustomName('');
            setIsCustom(false);
        } catch (err) {
            alert("Waduh, gagal mengaktifkan akun baru!");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-md animate-in fade-in zoom-in duration-300 text-left">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.05)] relative">
                
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black italic text-white tracking-widest uppercase flex items-center gap-3">
                        <Wallet className="text-amber-500" size={24}/> Tambah Dompet
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-4 gap-2 md:gap-3">
                        {[
                            { id: 'cash', icon: <Coins size={20}/>, label: 'Tunai' },
                            { id: 'bank', icon: <Landmark size={20}/>, label: 'Bank' },
                            { id: 'ewallet', icon: <Smartphone size={20}/>, label: 'E-Wallet' },
                            { id: 'investment', icon: <TrendingUp size={20}/>, label: 'Invest' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                // Gunakan fungsi handleTypeChange di sini
                                onClick={() => handleTypeChange(item.id)}
                                className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border transition-all ${
                                    form.type === item.id 
                                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/10 scale-105' 
                                    : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                                }`}
                            >
                                {item.icon}
                                <span className="text-[9px] font-bold uppercase mt-2 tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">
                            {form.type === 'bank' ? 'Pilih Bank OJK' : form.type === 'ewallet' ? 'Pilih E-Wallet' : 'Nama Dompet'}
                        </label>
                        
                        {(form.type === 'bank' || form.type === 'ewallet') && (
                            <select 
                                required={!isCustom} 
                                value={selectedName} 
                                onChange={handleSelectChange}
                                className="w-full max-w-full truncate bg-slate-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-xs font-bold uppercase text-white tracking-wider cursor-pointer"
                            >
                                <option value="" disabled className="bg-slate-900 text-slate-500">-- Klik Untuk Memilih --</option>
                                {(form.type === 'bank' ? bankList : eWalletList).map(item => (
                                    <option key={item} value={item} className="bg-slate-900">{item}</option>
                                ))}
                                <option value="Lainnya" className="bg-slate-900 text-amber-500 font-black">⊕ LAINNYA (KETIK SENDIRI)</option>
                            </select>
                        )}

                        {(isCustom || form.type === 'cash' || form.type === 'investment') && (
                            <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                                <input 
                                    type="text" 
                                    placeholder={
                                        form.type === 'cash' ? "Contoh: Dompet Utama, Celengan..." : 
                                        form.type === 'investment' ? "Contoh: Saham BBCA, Reksa Dana..." : 
                                        "Ketik nama di sini..."
                                    }
                                    required 
                                    value={customName} 
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-white/10 py-3 px-2 text-sm font-bold text-white outline-none focus:border-amber-500 transition-all uppercase tracking-widest placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Saldo Awal (Rp)</label>
                        <input 
                            type="number" 
                            placeholder="0" 
                            required 
                            value={form.balance} 
                            onChange={(e) => setForm({ ...form, balance: e.target.value })}
                            className="w-full bg-slate-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 text-lg md:text-xl font-black text-amber-500 italic" 
                        />
                    </div>

                    <GoldButton className="w-full py-5 mt-8"><Check size={20}/> Aktifkan Dompet</GoldButton>
                </form>
            </div>
        </div>
    );
};

export default AccountModal;