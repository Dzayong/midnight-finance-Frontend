import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, Loader2, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // 1. Ambil token dan email LANGSUNG dari URL saat pertama kali halaman dimuat
    // Disimpan ke dalam State agar tetap ingat walaupun URL-nya nanti kita hapus
    const [token] = useState(searchParams.get('token') || '');
    const [email] = useState(searchParams.get('email') || '');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // 🎩 2. TRIK SULAP SULTAN: Bersihkan URL setelah komponen selesai dimuat
    useEffect(() => {
        // Kalau di URL masih ada tulisan "?token=...", kita hapus seketika!
        if (searchParams.get('token')) {
            // 'replace: true' bikin user gak bisa nekan tombol "Back" ke URL kotor tadi
            navigate('/reset-password', { replace: true });
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        // Validasi simpel di sisi React
        if (password !== passwordConfirmation) {
            setMessage({ type: 'error', text: '🚨 Kata sandi tidak cocok!' });
            setIsLoading(false);
            return;
        }

        try {
            // Mengirim data ke Laravel menggunakan state yang sudah disimpan di memori
            const res = await axios.post(`${baseURL}/reset-password`, {
                token: token,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            });

            setMessage({ type: 'success', text: '✅ Sandi berhasil diubah! Mengalihkan ke brankas...' });
            
            // Arahkan ke halaman login setelah 2 detik
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || '🚨 Gagal mengubah kata sandi. Link mungkin sudah basi.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 🛡️ 3. SATPAM HALAMAN: Tolak akses kalau masuk halaman ini tanpa bawa token/email
    if (!token || !email) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center text-rose-500 font-black tracking-widest uppercase p-4 text-center">
                Akses Ditolak. Gunakan link resmi dari email Anda.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden">
            {/* EFEK CAHAYA SULTAN */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative bg-slate-900/40 backdrop-blur-2xl text-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 w-full max-w-md transition-all duration-500 animate-in zoom-in-95">
                <div className="flex flex-col items-center">
                    <div className="mb-8 flex items-center justify-center">
                        <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                            <KeyRound size={32} className="text-slate-900"/>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black mb-2 text-center text-white italic tracking-tight uppercase">
                        Kunci Baru
                    </h2>
                    <p className="text-slate-500 mb-8 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
                        Amankan kembali brankas digital Anda
                    </p>

                    {message && (
                        <div className={`w-full p-4 mb-6 rounded-2xl text-center text-[10px] font-black tracking-widest uppercase shadow-lg animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20}/>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Kata Sandi Baru" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full bg-slate-950/50 border border-white/10 p-4 pl-12 pr-12 rounded-2xl outline-none text-sm font-bold text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-slate-600" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20}/>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Konfirmasi Kata Sandi" 
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                                minLength={8}
                                className="w-full bg-slate-950/50 border border-white/10 p-4 pl-12 rounded-2xl outline-none text-sm font-bold text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-slate-600" 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black tracking-widest uppercase text-[10px] py-5 rounded-2xl flex items-center justify-center gap-3 mt-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><KeyRound size={18}/> Simpan Sandi Baru</>}
                        </button>
                    </form>

                    <button 
                        onClick={() => navigate('/login')}
                        className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-amber-500 transition-colors flex items-center gap-2"
                    >
                        Kembali ke Halaman Login <ArrowRight size={14}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;