import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, Loader2, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Ambil token dan email LANGSUNG dari URL
    const [token] = useState(searchParams.get('token') || '');
    const [email] = useState(searchParams.get('email') || '');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // --- LOGIKA CHECKLIST SANDI (KONSISTENSI DENGAN AUTH.JSX) ---
    const reqs = {
        length: password.length >= 8,
        cases: /[a-z]/.test(password) && /[A-Z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^a-zA-Z0-9]/.test(password)
    };
    const isPasswordStrong = reqs.length && reqs.cases && reqs.number && reqs.symbol;
    const canSubmit = isPasswordStrong && (password === passwordConfirmation);

    // Trik bersihkan URL setelah komponen dimuat
    useEffect(() => {
        if (searchParams.get('token')) {
            navigate('/reset-password', { replace: true });
        }
    }, [searchParams, navigate]);

    // Error Handler Universal
    const handleError = (err) => {
        if (err.response?.data?.errors) {
            const errorMessages = Object.values(err.response.data.errors).flat().join(' | ');
            setMessage({ type: 'error', text: errorMessages });
        } else if (err.response?.data?.message) {
            setMessage({ type: 'error', text: err.response.data.message });
        } else {
            setMessage({ type: 'error', text: 'Terjadi kesalahan pada koneksi peladen.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await axios.post(`${baseURL}/reset-password`, {
                token: token,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            });

            setMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui. Mengalihkan ke sistem otorisasi...' });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Tolak akses kalau masuk halaman ini tanpa bawa token/email
    if (!token || !email) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-4">
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black tracking-widest uppercase p-6 rounded-2xl text-center text-xs shadow-lg max-w-md">
                    Otorisasi Ditolak. Silakan gunakan tautan resmi yang dikirimkan ke email Anda.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden">
            
            {/* PEMBUNGKUS DENGAN EFEK "RUNNING SNAKE BORDER" */}
            <div className="relative w-full max-w-md rounded-[2.5rem] p-[2px] overflow-hidden group">
                
                {/* Garis Lari (Conic Gradient Berputar) */}
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_70%,#f59e0b_100%)] animate-[spin_3s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Kotak Utama Form */}
                <div className="relative bg-[#0b1120] rounded-[2.4rem] p-8 md:p-12 h-full w-full z-10 shadow-2xl">
                    <div className="flex flex-col items-center">
                        <div className="mb-8 flex items-center justify-center">
                            <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <KeyRound size={32} className="text-slate-900 animate-pulse"/>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black mb-2 text-center text-white italic tracking-tight uppercase">
                            Kunci Keamanan Baru
                        </h2>
                        <p className="text-slate-500 mb-8 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
                            Atur ulang akses untuk brankas digital Anda
                        </p>

                        {message && (
                            <div className={`w-full p-4 mb-6 rounded-2xl text-center text-[11px] font-bold tracking-wider shadow-lg animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="relative mb-2 group z-10">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20}/>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Kata Sandi Baru" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-900/80 text-slate-200 border border-white/10 p-4 pl-12 pr-12 rounded-2xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-slate-500 shadow-inner group-hover:border-amber-500/50" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* CHECKLIST INDIKATOR SANDI */}
                            <div className="px-2 mb-4">
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <div className={`flex items-center gap-1.5 transition-colors ${reqs.length ? 'text-emerald-500' : ''}`}>
                                        {reqs.length ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Min. 8 Karakter
                                    </div>
                                    <div className={`flex items-center gap-1.5 transition-colors ${reqs.cases ? 'text-emerald-500' : ''}`}>
                                        {reqs.cases ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Huruf Besar & Kecil
                                    </div>
                                    <div className={`flex items-center gap-1.5 transition-colors ${reqs.number ? 'text-emerald-500' : ''}`}>
                                        {reqs.number ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Memuat Angka
                                    </div>
                                    <div className={`flex items-center gap-1.5 transition-colors ${reqs.symbol ? 'text-emerald-500' : ''}`}>
                                        {reqs.symbol ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Karakter Spesial
                                    </div>
                                </div>
                            </div>

                            <div className="relative mb-6 group z-10">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20}/>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Konfirmasi Kata Sandi" 
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required
                                    className="w-full bg-slate-900/80 text-slate-200 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-slate-500 shadow-inner group-hover:border-amber-500/50" 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading || !canSubmit}
                                className={`relative z-10 w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black tracking-widest uppercase text-xs py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${(!canSubmit || isLoading) ? 'opacity-50 cursor-not-allowed grayscale-[30%]' : 'hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)]'}`}
                            >
                                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div> : <KeyRound size={18}/>}
                                <span>{isLoading ? 'MEMPROSES...' : 'SIMPAN KUNCI BARU'}</span>
                            </button>
                        </form>

                        <button 
                            onClick={() => navigate('/login')}
                            className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-amber-500 transition-colors flex items-center gap-2 relative z-10"
                        >
                            <ArrowLeft size={14}/> Kembali ke Otorisasi 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;