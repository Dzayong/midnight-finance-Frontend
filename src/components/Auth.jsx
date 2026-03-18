import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, LogIn, Mail, Lock, User, Gem, KeyRound } from 'lucide-react';

// 1. INPUT FIELD COMPONENT
const InputField = ({ icon: Icon, type, name, placeholder, value, onChange }) => (
    <div className="relative mb-5 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors duration-300">
            <Icon size={20} />
        </div>
        <input 
            type={type} 
            name={name} 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange} 
            required
            className="w-full bg-slate-900/50 text-slate-200 border border-white/10 rounded-2xl py-4 pl-12 pr-4 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all duration-300 shadow-inner group-hover:border-amber-500/50"
        />
    </div>
);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const endpoint = isLogin ? '/login' : '/register';
        const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

        try {
            const response = await axios.post(`${baseURL}${endpoint}`, payload);
            
            if (isLogin) {
                // --- PERBAIKAN DI SINI BANG ---
                // 1. Ambil Token (Cek apakah namanya 'access_token' atau 'token' dari Laravelmu)
                const token = response.data.access_token || response.data.token;
                const userData = response.data.user;

                if (token && userData) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    setMessage({ type: 'success', text: '✅ Akses Diberikan! Membuka brankas...' });
                    
                    // Beri jeda dikit biar user sempet liat pesen suksesnya
                    setTimeout(() => {
                        // Jika user baru (inactive), arahkan ke setup, jika lama ke dashboard
                        if (userData.status === 'inactive') {
                            navigate('/setup');
                        } else {
                            navigate('/dashboard');
                        }
                    }, 1500);
                } else {
                    throw new Error("Data user atau token tidak lengkap dari server.");
                }
            } else {
                // Alur Registrasi
                setRegisteredEmail(formData.email);
                setMessage({ type: 'success', text: `✅ Registrasi berhasil! Mengirim OTP ke email...` });
                
                setTimeout(() => {
                    setShowOTP(true);
                    setMessage(null);
                }, 2000);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await axios.post(`${baseURL}/verify-otp`, {
                email: registeredEmail,
                otp_code: otp
            });

            setMessage({ type: 'success', text: '✅ Verifikasi Sukses! Silakan Masuk.' });
            
            setTimeout(() => {
                setShowOTP(false);
                setIsLogin(true);
                setFormData({ name: '', email: '', password: '', password_confirmation: '' });
                setOtp('');
                setMessage(null);
            }, 2000);

        } catch (err) {
            setMessage({ type: 'error', text: `🚨 Kode OTP tidak valid atau kadaluarsa!` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (err) => {
        console.error("Auth Error:", err.response?.data);
        if (err.response?.data?.errors) {
            const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
            setMessage({ type: 'error', text: `🚨 ${errorMessages}` });
        } else if (err.response?.data?.message) {
            setMessage({ type: 'error', text: `🚨 ${err.response.data.message}` });
        } else {
            setMessage({ type: 'error', text: `💥 Gagal terhubung ke server utama.` });
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative bg-slate-900/40 backdrop-blur-2xl text-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 w-full max-w-md transition-all duration-500">
                <div className="flex flex-col items-center">
                    <div className="mb-8 flex items-center justify-center">
                        <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                            {showOTP ? <KeyRound size={32} className="text-slate-900 animate-pulse"/> : <Gem size={32} className="text-slate-900"/>}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black mb-2 text-center text-white italic tracking-tight">
                        {showOTP ? 'VERIFIKASI KEAMANAN' : (isLogin ? 'MIDNIGHT ACCESS' : 'JOIN THE ELITE')}
                    </h2>
                    <p className="text-slate-500 mb-8 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
                        {showOTP ? `Masukkan OTP dari ${registeredEmail}` : (isLogin ? 'Masuk ke brankas digitalmu' : 'Mulai kendalikan asetmu hari ini')}
                    </p>

                    {message && (
                        <div className={`w-full p-4 mb-6 rounded-2xl text-center text-xs font-bold tracking-widest uppercase shadow-lg animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    {showOTP ? (
                        <form onSubmit={handleVerifyOTP} className="w-full animate-in fade-in slide-in-from-right-4">
                            <div className="relative mb-6">
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    placeholder="••••••" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                                    required
                                    className="w-full bg-slate-900/50 text-amber-500 border border-white/10 rounded-2xl py-4 text-center text-4xl font-mono tracking-[0.5em] focus:outline-none focus:border-amber-500 transition-all duration-300 shadow-inner"
                                />
                            </div>
                            <button type="submit" disabled={isLoading || otp.length < 6}
                                className={`w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black tracking-widest uppercase text-xs py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] ${isLoading || otp.length < 6 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div> : <KeyRound size={18}/>}
                                <span>{isLoading ? 'MEMVERIFIKASI...' : 'VERIFIKASI OTP'}</span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleAuth} className="w-full animate-in fade-in slide-in-from-left-4">
                            {!isLogin && <InputField icon={User} type="text" name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleInputChange} />}
                            <InputField icon={Mail} type="email" name="email" placeholder="Alamat Email" value={formData.email} onChange={handleInputChange} />
                            <InputField icon={Lock} type="password" name="password" placeholder="Kata Sandi (Min. 8 Karakter)" value={formData.password} onChange={handleInputChange} />
                            {!isLogin && <InputField icon={Lock} type="password" name="password_confirmation" placeholder="Konfirmasi Kata Sandi" value={formData.password_confirmation} onChange={handleInputChange} />}

                            <button type="submit" disabled={isLoading}
                                className={`w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black tracking-widest uppercase text-xs py-4 rounded-2xl flex items-center justify-center gap-3 mt-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div> : (isLogin ? <LogIn size={18}/> : <UserPlus size={18}/>)}
                                <span>{isLoading ? 'MEMPROSES...' : (isLogin ? 'MASUK SEKARANG' : 'DAFTAR & MINTA OTP')}</span>
                            </button>
                        </form>
                    )}

                    {!showOTP && (
                        <p className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                            {isLogin ? 'Belum Punya Akses?' : 'Sudah Menjadi Member?'}
                            <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(null); }} className="text-amber-500 font-black ml-2 hover:text-amber-400 transition-colors group">
                                <span className="group-hover:mr-1 transition-all">{isLogin ? 'Daftar Di Sini' : 'Masuk Di Sini'}</span>
                                <ArrowRight size={12} className="inline-block group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;