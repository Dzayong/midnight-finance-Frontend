import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, X, ArrowRight, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';

const Setup = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // 1. DATA REFERENSI DOMPET
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

    // 2. STATE MANAGEMENT
    const [accounts, setAccounts] = useState([
        // Default awal: tipe cash otomatis bernama Cash
        { id: '1', type: 'cash', name: 'Cash', balance: '', isCustom: false },
        { id: '2', type: 'bank', name: '', balance: '', isCustom: false }
    ]);

    const [categories, setCategories] = useState([
        { id: '1', name: '', type: 'expense' },
        { id: '2', name: '', type: 'income' }
    ]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    // 3. HANDLERS DOMPET (STEP 1)
    const handleAccountTypeChange = (id, newType) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id === id) {
                return { 
                    ...acc, 
                    type: newType, 
                    // Jika tipe diubah ke cash, otomatis nama jadi 'Cash'. Jika bukan, kosongkan.
                    name: newType === 'cash' ? 'Cash' : '', 
                    isCustom: false 
                };
            }
            return acc;
        }));
    };

    const handleAccountNameSelect = (id, value) => {
        if (value === 'Lainnya') {
            setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, name: '', isCustom: true } : acc));
        } else {
            setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, name: value, isCustom: false } : acc));
        }
    };

    const handleAccountChange = (id, field, value) => {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, [field]: value } : acc));
    };

    const addAccount = () => {
        // Akun baru default-nya cash dan otomatis bernama Cash
        setAccounts(prev => [...prev, { id: Date.now().toString(), type: 'cash', name: 'Cash', balance: '', isCustom: false }]);
    };

    const removeAccount = (id) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    // 4. HANDLERS KATEGORI (STEP 2)
    const handleCategoryChange = (id, field, value) => {
        setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
    };
    const addCategory = () => {
        setCategories(prev => [...prev, { id: Date.now().toString(), name: '', type: 'expense' }]);
    };
    const removeCategory = (id) => {
        setCategories(prev => prev.filter(cat => cat.id !== id));
    };

    // 5. SUBMISSION KE BACKEND
    // 5. SUBMISSION KE BACKEND
    const handleSubmit = async () => {
        if (accounts.some(a => !a.name.trim()) || categories.some(c => !c.name.trim())) {
            alert("Harap lengkapi semua nama dompet dan nama kategori sebelum melanjutkan, Bang!");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const payload = {
                accounts: accounts.map(({ name, type, balance }) => ({
                    name, type, balance: balance === '' ? 0 : parseFloat(balance)
                })),
                categories: categories.map(({ name, type }) => ({
                    name, type
                }))
            };

            // Tembak ke rute Setup yang baru kita buat di Backend
            const res = await axios.post(`${baseURL}/setup`, payload, config);
            
            // 🚨 UPDATE PENTING: Perbarui data user di Local Storage 
            // karena Backend mengirimkan status user yang sudah 'active'
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Tendang ke Dashboard Sultan!
            navigate('/dashboard');
        } catch (error) {
            console.error("Setup Error:", error);
            alert("Gagal menyimpan data awal brankas.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-3 md:p-6 font-sans relative overflow-hidden">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] w-full max-w-2xl shadow-2xl p-5 md:p-10 relative z-10 transition-all duration-500">
                
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <Wallet size={28} className="text-slate-900" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black italic tracking-tight text-white mb-1">INISIALISASI BRANKAS</h1>
                    <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
                        {step === 1 ? 'Langkah 1: Daftarkan sumber danamumu' : 'Langkah 2: Buat kategori transaksimu sendiri'}
                    </p>
                    
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'w-10 bg-amber-500' : 'w-4 bg-white/10'}`}></div>
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'w-10 bg-amber-500' : 'w-4 bg-white/10'}`}></div>
                    </div>
                </div>

                {/* STEP 1: DOMPET & SALDO */}
                {step === 1 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                        <div className="max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar space-y-3">
                            {accounts.map((acc, index) => (
                                <div key={acc.id} className="bg-white/5 border border-white/5 p-3 md:p-4 rounded-2xl relative">
                                    
                                    {accounts.length > 1 && (
                                        <button onClick={() => removeAccount(acc.id)} className="absolute top-3 right-3 p-1 text-slate-600 hover:text-rose-500 transition-colors bg-slate-950 rounded-lg z-10">
                                            <X size={14} />
                                        </button>
                                    )}
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">Akun {index + 1}</div>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 items-end">
                                        
                                        <div className="md:col-span-3 flex gap-2 w-full">
                                            
                                            {/* DROPDOWN TIPE DOMPET */}
                                            <div className="relative w-[35%]">
                                                <select 
                                                    value={acc.type} 
                                                    onChange={(e) => handleAccountTypeChange(acc.id, e.target.value)}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-2 pr-6 py-2 md:py-3 focus:outline-none focus:border-amber-500 text-[10px] md:text-xs text-white uppercase appearance-none cursor-pointer"
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="bank">Bank</option>
                                                    <option value="ewallet">E-Wallet</option>
                                                    <option value="investment">Invest</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>

                                            {/* NAMA DOMPET (Otomatis "CASH" jika tipe cash) */}
                                            {(acc.type === 'bank' || acc.type === 'ewallet') && !acc.isCustom ? (
                                                <div className="relative w-[65%]">
                                                    <select 
                                                        value={acc.name} 
                                                        onChange={(e) => handleAccountNameSelect(acc.id, e.target.value)}
                                                        className="w-full max-w-full truncate bg-slate-950 border border-white/10 rounded-xl pl-2 pr-7 py-2 md:py-3 focus:outline-none focus:border-amber-500 text-[10px] md:text-xs font-bold uppercase text-white tracking-wider appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled className="text-slate-500">-- PILIH --</option>
                                                        {(acc.type === 'bank' ? bankList : eWalletList).map(item => (
                                                            <option key={item} value={item}>{item}</option>
                                                        ))}
                                                        <option value="Lainnya" className="text-amber-500 font-black">⊕ LAINNYA</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                                                        <ChevronDown size={14} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    value={acc.name} 
                                                    onChange={(e) => handleAccountChange(acc.id, 'name', e.target.value)} 
                                                    placeholder={acc.type === 'cash' ? "Cash" : "Ketik Nama..."}
                                                    readOnly={acc.type === 'cash'} // Terkunci jika tipe Cash
                                                    className={`w-[65%] bg-transparent border-b-2 border-white/10 px-2 py-2 md:py-3 focus:outline-none focus:border-amber-500 text-[11px] md:text-xs font-bold text-white transition-all uppercase placeholder:normal-case placeholder:font-normal ${acc.type === 'cash' ? 'opacity-50 cursor-not-allowed border-none' : ''}`} 
                                                />
                                            )}
                                        </div>

                                        <div className="md:col-span-2 relative w-full mt-1 md:mt-0">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">Rp</span>
                                            <input 
                                                type="number" 
                                                value={acc.balance} 
                                                onChange={(e) => handleAccountChange(acc.id, 'balance', e.target.value)} 
                                                placeholder="0" 
                                                className="w-full pl-8 pr-3 py-2 md:py-3 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-black text-amber-500 italic transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button onClick={addAccount} className="group text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-all py-2 pl-1 mt-2">
                            <Plus size={14} className="group-hover:rotate-90 transition-transform"/> Tambah Akun Baru
                        </button>
                        
                        <button onClick={() => setStep(2)} className="w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black py-4 rounded-2xl flex justify-center items-center gap-2 mt-6 hover:-translate-y-1 transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest text-xs">
                            Lanjutkan <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {/* STEP 2: KATEGORI */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar space-y-3">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex gap-2 items-center bg-white/5 border border-white/5 p-2 rounded-2xl">
                                    
                                    <div className="relative w-28 shrink-0">
                                        <select 
                                            value={cat.type} 
                                            onChange={(e) => handleCategoryChange(cat.id, 'type', e.target.value)} 
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-2 pr-7 py-3 focus:outline-none focus:border-amber-500 text-[10px] md:text-xs font-bold uppercase transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="expense">📉 Keluar</option>
                                            <option value="income">📈 Masuk</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>

                                    <input 
                                        type="text" 
                                        value={cat.name} 
                                        onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)} 
                                        placeholder="Ketik Nama Kategori..." 
                                        className="flex-1 min-w-0 bg-transparent border-b border-white/10 py-3 px-2 focus:outline-none focus:border-amber-500 text-[11px] md:text-xs font-bold text-white transition-all uppercase placeholder:normal-case placeholder:font-normal" 
                                    />
                                    {categories.length > 1 && (
                                        <button onClick={() => removeCategory(cat.id)} className="p-2.5 text-slate-500 hover:text-rose-500 bg-slate-950 rounded-xl transition-colors shrink-0">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={addCategory} className="group text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-all py-2 pl-1 mt-2">
                            <Plus size={14} className="group-hover:rotate-90 transition-transform"/> Tambah Kategori Baru
                        </button>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep(1)} className="bg-white/5 text-slate-400 font-bold py-4 px-5 rounded-2xl flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all">
                                <ArrowLeft size={16} />
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading} 
                                className="flex-1 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:-translate-y-1 transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest text-[11px] md:text-xs disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {isLoading ? 'MENYIMPAN...' : <><CheckCircle2 size={16}/> SELESAIKAN SETUP</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Setup;