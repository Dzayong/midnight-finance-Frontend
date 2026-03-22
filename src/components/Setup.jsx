import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, X, ArrowRight, ArrowLeft, CheckCircle2, ChevronDown, Landmark, Tag } from 'lucide-react';
import Swal from 'sweetalert2'; // 👈 Tambahan SweetAlert

const Setup = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // 1. DATA REFERENSI DOMPET
    const bankList = [
        "PT Bank Central Asia (BCA)", "PT Bank Mandiri (Persero) (Mandiri)", "PT Bank Negara Indonesia (Persero) (BNI)",
        "PT Bank Rakyat Indonesia (Persero) (BRI)", "PT Bank Syariah Indonesia (BSI)", "PT Bank CIMB Niaga (CIMB Niaga)",
        "PT Bank Tabungan Negara (Persero) (BTN)", "PT Bank Danamon Indonesia (Danamon)", "PT Bank Permata (Permata)",
        "PT Bank Jago (Jago)", "PT Bank Seabank Indonesia (SeaBank)", "PT Bank Neo Commerce (BNC)", "PT Bank Aladin Syariah (Aladin)",
        "PT Bank Maybank Indonesia", "PT Bank OCBC Indonesia", "PT Bank Pan Indonesia (Panin Bank)", "PT Bank Mega",
        "PT Bank BTPN", "PT Bank KB Bukopin", "PT Bank Sinarmas", "PT Bank Mestika Dharma", "PT Bank UOB Indonesia",
        "PT Bank DBS Indonesia", "PT Bank HSBC Indonesia", "PT Bank Commonwealth", "PT Bank Woori Saudara Indonesia 1906",
        "PT Bank Artha Graha Internasional", "PT Bank Bumi Arta", "PT Bank Capital Indonesia", "PT Bank DKI",
        "PT Bank Jawa Barat dan Banten (BJB)", "PT Bank Jawa Tengah (Jateng)", "PT Bank Jawa Timur (Jatim)",
        "PT Bank Daerah Istimewa Yogyakarta (DIY)", "PT Bank Papua", "PT Bank Nagari (Sumatera Barat)", "PT Bank Sumatera Utara (Sumut)",
        "PT Bank Riau Kepri Syariah", "PT Bank Sumatera Selatan dan Bangka Belitung", "PT Bank Lampung", "PT Bank Kalimantan Barat (Kalbar)",
        "PT Bank Kalimantan Selatan (Kalsel)", "PT Bank Kalimantan Tengah (Kalteng)", "PT Bank Kalimantan Timur dan Kalimantan Utara (Kaltimtara)",
        "PT Bank Sulawesi Utara dan Gorontalo (Sulutgo)", "PT Bank Sulawesi Tengah (Sulteng)", "PT Bank Sulawesi Tenggara (Sultra)",
        "PT Bank Sulawesi Selatan dan Sulawesi Barat (Sulselbar)", "PT Bank Nusa Tenggara Barat Syariah (NTB Syariah)",
        "PT Bank Nusa Tenggara Timur (NTT)", "PT Bank Maluku dan Maluku Utara", "PT Bank Bali (BPD Bali)", "PT Bank Bengkulu",
        "PT Bank Jambi", "PT Bank Ganesha", "PT Bank Ina Perdana", "PT Bank Index Selindo", "PT Bank Jasa Jakarta",
        "PT Bank Maspion Indonesia", "PT Bank Mayapada Internasional", "PT Bank MNC Internasional", "PT Bank Multiarta Sentosa",
        "PT Bank Nationalnobu (Nobu Bank)", "PT Bank Oke Indonesia", "PT Bank QNB Indonesia", "PT Bank Resona Perdania",
        "PT Bank Sahabat Sampoerna", "PT Bank SBI Indonesia", "PT Bank Shinhan Indonesia", "PT Bank Standard Chartered Indonesia",
        "PT Bank Victoria Internasional", "PT Bank Amar Indonesia", "PT Bank IBK Indonesia", "PT Bank KEB Hana Indonesia",
        "PT Bank BNP Paribas Indonesia", "PT Bank China Construction Bank Indonesia", "PT Bank ICBC Indonesia",
        "PT Bank J Trust Indonesia", "PT Bank Mizuho Indonesia", "PT Bank Sumitomo Mitsui Indonesia", "PT Bank Muamalat Indonesia",
        "PT Bank Victoria Syariah", "PT Bank BCA Syariah", "PT Bank BJB Syariah", "PT Bank Mega Syariah", "PT Bank Panin Dubai Syariah",
        "PT Bank Bukopin Syariah", "PT Bank BTPN Syariah", "PT Bank Maybank Syariah Indonesia", "PT Bank Nano Syariah",
        "PT Bank Allo Indonesia (Allo Bank)", "PT Bank Digital BCA (Blu)", "PT Bank Superbank Indonesia", "PT Bank Krom Indonesia (Krom)",
        "PT Bank Fama Konfirmasi (Hibank)", "PT Bank Raya Indonesia", "PT Bank Bisnis Internasional", "PT Bank Sri Partha", "PT Bank Artos Indonesia"
    ];
    const eWalletList = ["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja", "AstraPay", "i.Saku"];

    // 2. STATE MANAGEMENT
    const [accounts, setAccounts] = useState([
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

    // 💡 FUNGSI AUTO-MASKING RUPIAH
    const formatCurrency = (value) => {
        if (!value) return '';
        const rawValue = value.toString().replace(/\D/g, ''); 
        if (!rawValue) return '';
        return parseInt(rawValue, 10).toLocaleString('id-ID'); 
    };

    // 3. HANDLERS DOMPET (STEP 1)
    const handleAccountTypeChange = (id, newType) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id === id) {
                return { 
                    ...acc, 
                    type: newType, 
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
        // Jika field yang diubah adalah balance, pastikan hanya menyimpan angka murni
        const finalValue = field === 'balance' ? value.replace(/\D/g, '') : value;
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, [field]: finalValue } : acc));
    };

    const addAccount = () => {
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
    const handleSubmit = async () => {
        if (accounts.some(a => !a.name.trim()) || categories.some(c => !c.name.trim())) {
            return Swal.fire({
                title: 'DATA BELUM LENGKAP',
                text: 'Harap lengkapi semua nama dompet dan nama kategori sebelum melanjutkan, Bang!',
                icon: 'warning',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#f59e0b'
            });
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const payload = {
                accounts: accounts.map(({ name, type, balance }) => ({
                    name, type, balance: balance === '' ? 0 : Number(balance)
                })),
                categories: categories.map(({ name, type }) => ({
                    name, type
                }))
            };

            const res = await axios.post(`${baseURL}/setup`, payload, config);
            
            localStorage.setItem('user', JSON.stringify(res.data.user));

            Swal.fire({
                title: 'BRANKAS SIAP!',
                text: 'Selamat datang di Portofolio Digital Anda.',
                icon: 'success',
                background: '#0f172a',
                color: '#fff',
                showConfirmButton: false,
                timer: 1500
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error("Setup Error:", error);
            Swal.fire({
                title: 'GAGAL MENYIMPAN',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data awal.',
                icon: 'error',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
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
                        <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {accounts.map((acc, index) => (
                                <div key={acc.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl relative group">
                                    
                                    {accounts.length > 1 && (
                                        <button onClick={() => removeAccount(acc.id)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors bg-slate-950 rounded-lg z-10">
                                            <X size={14} />
                                        </button>
                                    )}
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Landmark size={12} className="text-amber-500"/> Akun {index + 1}
                                    </div>

                                    {/* LAYOUT RESPONSIVE (Atas Bawah di HP, Nyamping di Laptop) */}
                                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                                        
                                        {/* Kiri: Dropdown Tipe & Nama */}
                                        <div className="flex w-full md:w-[60%] gap-2">
                                            <div className="relative w-2/5">
                                                <select 
                                                    value={acc.type} 
                                                    onChange={(e) => handleAccountTypeChange(acc.id, e.target.value)}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-3 pr-7 py-3 focus:outline-none focus:border-amber-500 text-[10px] md:text-xs text-white uppercase appearance-none cursor-pointer"
                                                >
                                                    <option value="cash" className="bg-slate-900">Cash</option>
                                                    <option value="bank" className="bg-slate-900">Bank</option>
                                                    <option value="ewallet" className="bg-slate-900">E-Wallet</option>
                                                    <option value="investment" className="bg-slate-900">Invest</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>

                                            {(acc.type === 'bank' || acc.type === 'ewallet') && !acc.isCustom ? (
                                                <div className="relative w-3/5">
                                                    <select 
                                                        value={acc.name} 
                                                        onChange={(e) => handleAccountNameSelect(acc.id, e.target.value)}
                                                        className="w-full truncate bg-slate-950 border border-white/10 rounded-xl pl-3 pr-7 py-3 focus:outline-none focus:border-amber-500 text-[10px] md:text-xs font-bold uppercase text-white tracking-wider appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled className="text-slate-500 bg-slate-900">-- PILIH --</option>
                                                        {(acc.type === 'bank' ? bankList : eWalletList).map(item => (
                                                            <option key={item} value={item} className="bg-slate-900">{item}</option>
                                                        ))}
                                                        <option value="Lainnya" className="text-amber-500 font-black bg-slate-900">⊕ LAINNYA</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                                                        <ChevronDown size={14} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-3/5">
                                                    <input 
                                                        type="text" 
                                                        value={acc.name} 
                                                        onChange={(e) => handleAccountChange(acc.id, 'name', e.target.value)} 
                                                        placeholder={acc.type === 'cash' ? "Cash" : "Ketik Nama..."}
                                                        readOnly={acc.type === 'cash'} 
                                                        className={`w-full bg-slate-950 border border-white/10 px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500 text-[11px] md:text-xs font-bold text-white transition-all uppercase placeholder:normal-case placeholder:font-normal ${acc.type === 'cash' ? 'opacity-50 cursor-not-allowed border-none' : ''}`} 
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Kanan: Saldo Awal dengan Auto Rupiah */}
                                        <div className="relative w-full md:w-[40%] mt-1 md:mt-0">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold">Rp</span>
                                            <input 
                                                type="text" // 👈 UBAH JADI TEXT BIAR BISA ADA TITIKNYA
                                                value={formatCurrency(acc.balance)} 
                                                onChange={(e) => handleAccountChange(acc.id, 'balance', e.target.value)} 
                                                placeholder="0" 
                                                className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-black text-amber-500 italic transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button onClick={addAccount} className="group text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-all py-3 pl-1 mt-2">
                            <Plus size={14} className="group-hover:rotate-90 transition-transform bg-amber-500/10 p-0.5 rounded-full"/> Tambah Akun Baru
                        </button>
                        
                        <button onClick={() => setStep(2)} className="w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black py-4 rounded-2xl flex justify-center items-center gap-2 mt-6 hover:-translate-y-1 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] uppercase tracking-widest text-xs">
                            Lanjutkan <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {/* STEP 2: KATEGORI */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex flex-col md:flex-row gap-3 items-center bg-white/5 border border-white/5 p-3 rounded-2xl group relative">
                                    
                                    {categories.length > 1 && (
                                        <button onClick={() => removeCategory(cat.id)} className="absolute top-3 right-3 md:relative md:top-auto md:right-auto p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 bg-slate-950 rounded-xl transition-colors shrink-0">
                                            <X size={14} />
                                        </button>
                                    )}

                                    <div className="flex w-full gap-3">
                                        <div className="relative w-1/3 md:w-32 shrink-0">
                                            <select 
                                                value={cat.type} 
                                                onChange={(e) => handleCategoryChange(cat.id, 'type', e.target.value)} 
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-3 pr-7 py-3 focus:outline-none focus:border-amber-500 text-[10px] md:text-xs font-bold uppercase transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="expense" className="bg-slate-900">📉 Keluar</option>
                                                <option value="income" className="bg-slate-900">📈 Masuk</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>

                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Tag size={14} />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={cat.name} 
                                                onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)} 
                                                placeholder="Nama Kategori" 
                                                className="w-full bg-slate-950 border border-white/10 py-3 pl-9 pr-3 rounded-xl focus:outline-none focus:border-amber-500 text-[11px] md:text-xs font-bold text-white transition-all uppercase placeholder:normal-case placeholder:font-normal" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button onClick={addCategory} className="group text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-all py-3 pl-1 mt-2">
                            <Plus size={14} className="group-hover:rotate-90 transition-transform bg-amber-500/10 p-0.5 rounded-full"/> Tambah Kategori Baru
                        </button>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep(1)} className="bg-white/5 text-slate-400 font-bold py-4 px-5 rounded-2xl flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all">
                                <ArrowLeft size={16} />
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading} 
                                className="flex-1 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:-translate-y-1 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] uppercase tracking-widest text-[11px] md:text-xs disabled:opacity-50 disabled:hover:translate-y-0"
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