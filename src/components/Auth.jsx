import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, LogIn, Mail, Lock, User, Gem, KeyRound, RefreshCw, ArrowLeft, Wand2, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

// 1. KOMPONEN INPUT FIELD (Mendukung Icon Kanan Ganda)
const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, rightElement }) => (
    <div className="relative mb-5 group z-10">
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
            className="w-full bg-slate-900/80 text-slate-200 border border-white/10 rounded-2xl py-4 pl-12 pr-20 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 shadow-inner group-hover:border-amber-500/50"
        />
        {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2 z-20">
                {rightElement}
            </div>
        )}
    </div>
);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isOtpExpired, setIsOtpExpired] = useState(false); 
    
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // Format: { type: 'success' | 'error', text: 'Pesan' }
    
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // --- LOGIKA CHECKLIST SANDI ---
    const pass = formData.password;
    const reqs = {
        length: pass.length >= 8,
        cases: /[a-z]/.test(pass) && /[A-Z]/.test(pass),
        number: /\d/.test(pass),
        symbol: /[^a-zA-Z0-9]/.test(pass)
    };
    const isPasswordStrong = reqs.length && reqs.cases && reqs.number && reqs.symbol;

    // --- PROGRESSIVE VALIDATION ---
    const isEmailValid = formData.email.includes('@') && formData.email.includes('.');
    const isLoginValid = isEmailValid && pass.length > 0;
    const isRegisterValid = isEmailValid && isPasswordStrong && (pass === formData.password_confirmation) && formData.name.length > 0;
    const canSubmitAuth = isLogin ? isLoginValid : isRegisterValid;

    // --- GENERATE SANDI OTOMATIS ---
    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        const syms = "!@#$%^&*";
        
        let newPass = chars[Math.floor(Math.random() * chars.length)] + 
                      upper[Math.floor(Math.random() * upper.length)] + 
                      nums[Math.floor(Math.random() * nums.length)] + 
                      syms[Math.floor(Math.random() * syms.length)];
                   
        const all = chars + upper + nums + syms;
        for (let i = 0; i < 8; i++) newPass += all[Math.floor(Math.random() * all.length)];
        
        newPass = newPass.split('').sort(() => 0.5 - Math.random()).join('');
        
        setFormData({ ...formData, password: newPass, password_confirmation: newPass });
        setShowPassword(true); // Otomatis tampilkan sandi agar user bisa melihat dan menyalin
    };

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
                const token = response.data.access_token;
                const userData = response.data.user;

                if (token && userData) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    setMessage({ type: 'success', text: response.data.message || 'Akses diberikan. Membuka brankas...' });
                    
                    setTimeout(() => {
                        if (userData.status === 'inactive') navigate('/setup');
                        else navigate('/dashboard');
                    }, 1500);
                }
            } else {
                setRegisteredEmail(formData.email);
                setMessage({ type: 'success', text: response.data.message || 'Registrasi berhasil. Mengirimkan kode verifikasi...' });
                setTimeout(() => {
                    setShowOTP(true);
                    setMessage(null);
                }, 2000);
            }
        } catch (err) {
            if (isLogin && err.response?.data?.need_otp) {
                setRegisteredEmail(formData.email);
                setShowOTP(true);
                setMessage({ type: 'error', text: err.response.data.message });
            } else {
                handleError(err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setIsOtpExpired(false);

        try {
            const response = await axios.post(`${baseURL}/verify-otp`, { email: registeredEmail, otp_code: otp });
            setMessage({ type: 'success', text: response.data.message || 'Verifikasi berhasil. Silakan masuk.' });
            setTimeout(() => {
                setShowOTP(false);
                setIsLogin(true);
                setFormData({ name: '', email: '', password: '', password_confirmation: '' });
                setOtp('');
                setMessage(null);
            }, 2000);
        } catch (err) {
            if (err.response?.data?.expired) setIsOtpExpired(true);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Kode verifikasi tidak valid.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await axios.post(`${baseURL}/resend-otp`, { email: registeredEmail });
            setMessage({ type: 'success', text: res.data.message });
            setIsOtpExpired(false); 
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden">
            
            {/* 2. PEMBUNGKUS DENGAN EFEK "RUNNING SNAKE BORDER" */}
            <div className="relative w-full max-w-md rounded-[2.5rem] p-[2px] overflow-hidden group">
                
                {/* Garis Lari (Conic Gradient Berputar) */}
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_70%,#f59e0b_100%)] animate-[spin_3s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Kotak Utama Form (Menutupi tengahnya, menyisakan 2px border luar) */}
                <div className="relative bg-[#0b1120] rounded-[2.4rem] p-8 md:p-12 h-full w-full z-10 shadow-2xl">
                    
                    <div className="flex flex-col items-center">
                        <div className="mb-8 flex items-center justify-center">
                            <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                {showOTP ? <KeyRound size={32} className="text-slate-900 animate-pulse"/> : <Gem size={32} className="text-slate-900"/>}
                            </div>
                        </div>

                        <h2 className="text-2xl font-black mb-2 text-center text-white italic tracking-tight uppercase">
                            {showOTP ? 'Verifikasi Keamanan' : (isLogin ? 'Masuk' : 'Pendaftaran')}
                        </h2>
                        <p className="text-slate-500 mb-8 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
                            {showOTP ? `Masukkan sandi satu waktu dari ${registeredEmail}` : (isLogin ? 'Masukkan kredensial brankas digital Anda' : 'Lengkapi identitas untuk inisiasi brankas')}
                        </p>

                        {/* NOTIFIKASI FORMAL (Tanpa Emotikon) */}
                        {message && (
                            <div className={`w-full p-4 mb-6 rounded-2xl text-center text-[11px] font-bold tracking-wider shadow-lg animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        {showOTP ? (
                            <div className="w-full animate-in fade-in slide-in-from-right-4">
                                <form onSubmit={handleVerifyOTP}>
                                    <div className="relative mb-6">
                                        <input type="text" maxLength="6" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required
                                            className="w-full bg-slate-900/50 text-amber-500 border border-white/10 rounded-2xl py-4 text-center text-4xl font-mono tracking-[0.5em] focus:outline-none focus:border-amber-500 transition-all duration-300 shadow-inner" />
                                    </div>
                                    <button type="submit" disabled={isLoading || otp.length < 6}
                                        className={`w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black tracking-widest uppercase text-xs py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${isLoading || otp.length < 6 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)]'}`}>
                                        {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div> : <KeyRound size={18}/>}
                                        <span>{isLoading ? 'MEMVERIFIKASI...' : 'VERIFIKASI OTP'}</span>
                                    </button>
                                </form>
                                <div className="mt-6 flex flex-col gap-3">
                                    {isOtpExpired && (
                                        <button type="button" onClick={handleResendOTP} disabled={isLoading} className="w-full bg-white/5 border border-white/10 text-amber-500 font-bold tracking-widest uppercase text-[10px] py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/> Kirim Ulang Kode Verifikasi
                                        </button>
                                    )}
                                    <button type="button" onClick={() => { setShowOTP(false); setMessage(null); setOtp(''); }} className="w-full text-slate-500 hover:text-white font-bold tracking-widest uppercase text-[10px] py-2 flex items-center justify-center gap-2 transition-colors">
                                        <ArrowLeft size={14}/> Kembali ke Otorisasi
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleAuth} className="w-full animate-in fade-in slide-in-from-left-4">
                                {!isLogin && <InputField icon={User} type="text" name="name" placeholder="Nama Lengkap Klien" value={formData.name} onChange={handleInputChange} />}
                                
                                <InputField icon={Mail} type="email" name="email" placeholder="Alamat Email Terdaftar" value={formData.email} onChange={handleInputChange} />
                                
                                <div className="mb-2 relative">
                                    <InputField 
                                        icon={Lock} 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        placeholder="Kata Sandi Keamanan" 
                                        value={formData.password} 
                                        onChange={handleInputChange} 
                                        rightElement={
                                            <>
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} title="Lihat Sandi" className="text-slate-500 hover:text-amber-500 transition-colors p-1.5">
                                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                                </button>
                                                {!isLogin && (
                                                    <button type="button" onClick={generatePassword} title="Buat Sandi Sistem" className="text-slate-500 hover:text-amber-500 transition-colors bg-slate-800 p-1.5 rounded-lg border border-white/5">
                                                        <Wand2 size={16}/>
                                                    </button>
                                                )}
                                            </>
                                        }
                                    />
                                    
                                    {/* 3. CHECKLIST INDIKATOR SANDI (Hanya saat Register) */}
                                    {!isLogin && (
                                        <div className="px-2 -mt-2 mb-4">
                                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                <div className={`flex items-center gap-1.5 transition-colors ${reqs.length ? 'text-emerald-500' : ''}`}>
                                                    {reqs.length ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Minimal 8 Karakter
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
                                    )}
                                </div>

                                {!isLogin && <InputField icon={Lock} type={showPassword ? "text" : "password"} name="password_confirmation" placeholder="Konfirmasi Kata Sandi" value={formData.password_confirmation} onChange={handleInputChange} />}

                                {/* Tautan Lupa Sandi */}
                                {isLogin && (
                                    <div className="flex justify-end -mt-3 mb-6 relative z-10">
                                        <button type="button" onClick={() => navigate('/reset-password')} className="text-[10px] text-amber-500 hover:text-amber-400 font-bold tracking-widest uppercase transition-colors">
                                            Pengaturan Ulang Sandi
                                        </button>
                                    </div>
                                )}

                                <button type="submit" disabled={isLoading || !canSubmitAuth}
                                    className={`relative z-10 w-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-black tracking-widest uppercase text-xs py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${(!canSubmitAuth || isLoading) ? 'opacity-50 cursor-not-allowed grayscale-[30%]' : 'hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)]'}`}>
                                    {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div> : (isLogin ? <LogIn size={18}/> : <UserPlus size={18}/>)}
                                    <span>{isLoading ? 'MEMPROSES...' : (isLogin ? 'MASUK' : 'PENDAFTARAN')}</span>
                                </button>
                            </form>
                        )}

                        {!showOTP && (
                            <p className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 relative z-10">
                                {isLogin ? 'Klien Baru?' : 'Klien Terdaftar?'}
                                <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(null); setFormData({name: '', email: '', password: '', password_confirmation: ''}); }} className="text-amber-500 font-black ml-2 hover:text-amber-400 transition-colors group">
                                    <span className="group-hover:mr-1 transition-all">{isLogin ? 'Pendaftaran' : 'Masuk'}</span>
                                    <ArrowRight size={12} className="inline-block group-hover:translate-x-1 transition-transform"/>
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;