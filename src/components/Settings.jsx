import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import { User, Mail, Camera, Save, Lock, Edit3, X, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

// 🚀 OPTIMASI: Fungsi berat dipindah ke luar agar tidak di-render ulang terus-menerus
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8);
    });
};

const Settings = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    
    // 1. Ambil data user awal
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : { name: '', email: '', avatar: null };
    });

    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(userData.name);
    
    // 2. State Khusus Crop Foto
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    // 3. UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingLink, setIsSendingLink] = useState(false);
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);

    const onCropComplete = useCallback((_area, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImage(reader.result);
                setShowCropper(true);
            };
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', name);

        try {
            if (image && croppedAreaPixels) {
                const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
                formData.append('avatar', croppedImageBlob, 'avatar.webp');
            }

            const res = await axios.post(`${baseURL}/profile/update`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'multipart/form-data' 
                }
            });

            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUserData(res.data.user);
            setMessage({ type: 'success', text: res.data.message });
            window.dispatchEvent(new Event('storage'));
            
        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Gagal memperbarui profil!' 
            });
            setName(userData.name); // Kembalikan nama kalau gagal
        } finally {
            setEditMode(false);
            setShowCropper(false);
            setIsLoading(false);
        }
    };

    const handleResetPasswordLink = async () => {
        setIsSendingLink(true);
        setMessage(null);
        try {
            // 🚨 SCRIPT SULTAN DIHIDUPKAN! Langsung tembak ke backend Laravel
            const response = await axios.post(`${baseURL}/forgot-password`, { 
                email: userData.email 
            });
            
            setMessage({ type: 'success', text: `✅ ${response.data.message}` });
        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Gagal mengirim link. Coba lagi nanti.' 
            });
        } finally {
            setIsSendingLink(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
            
            {/* MODAL CROPPER */}
            {showCropper && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-lg h-[50vh] sm:h-[60vh] bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    
                    <div className="w-full max-w-lg mt-6 sm:mt-8 space-y-6 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl">
                        <div className="space-y-3 text-center">
                            <p className="text-[10px] sm:text-xs text-amber-500 font-bold uppercase tracking-widest">Atur Zoom Foto</p>
                            <input 
                                type="range" 
                                value={zoom} 
                                min={1} max={3} step={0.1} 
                                onChange={(e) => setZoom(e.target.value)} 
                                className="w-full accent-amber-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer" 
                            />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button 
                                onClick={() => setShowCropper(false)} 
                                className="flex-1 py-3 sm:py-4 bg-white/5 hover:bg-white/10 active:scale-95 rounded-2xl font-bold uppercase text-[10px] sm:text-xs tracking-widest text-slate-400 transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={isLoading}
                                className="flex-1 py-3 sm:py-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex justify-center items-center gap-2"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Foto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
                <div className="text-left text-white">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tight uppercase drop-shadow-md">Pengaturan</h1>
                    <p className="text-[10px] sm:text-xs md:text-sm text-amber-500 font-bold tracking-[0.3em] uppercase mt-1 sm:mt-2">Elite Wealth Profile</p>
                </div>
                {!editMode && (
                    <button 
                        onClick={() => { setEditMode(true); setMessage(null); }} 
                        className="flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500 hover:text-slate-900 active:scale-95 transition-all shadow-lg"
                    >
                        <Edit3 size={16} className="sm:w-5 sm:h-5" /> Ubah Profil
                    </button>
                )}
            </div>

            {/* MAIN CARD */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative">
                
                {/* AVATAR SECTION */}
                <div className="flex flex-col items-center mb-8 sm:mb-12">
                    <div className="relative group">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-500/20 bg-slate-800 flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:border-amber-500/50">
                            {userData?.avatar ? (
                                <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-slate-700 sm:w-[50px] sm:h-[50px]" />
                            )}
                        </div>
                        {editMode && (
                            <button 
                                onClick={() => fileInputRef.current.click()} 
                                className="absolute bottom-0 right-0 p-2.5 sm:p-3 bg-amber-500 text-slate-900 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
                            >
                                <Camera size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>
                </div>

                {/* FORM SECTION */}
                <div className="space-y-5 sm:space-y-8 max-w-xl mx-auto">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase ml-2 tracking-widest">Nama Lengkap</label>
                        <div className="relative group">
                            <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${editMode ? 'text-slate-400 group-focus-within:text-amber-500' : 'text-slate-600'}`} size={18}/>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                disabled={!editMode} 
                                className={`w-full bg-slate-950/50 border border-white/5 py-3.5 sm:py-4 pr-4 pl-12 rounded-2xl outline-none text-sm sm:text-base font-bold text-white transition-all ${!editMode ? 'opacity-50 cursor-not-allowed' : 'focus:border-amber-500 focus:bg-slate-900 shadow-inner'}`} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase ml-2 tracking-widest">Alamat Email</label>
                        <div className="relative opacity-50 cursor-not-allowed">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                            <input 
                                type="email" 
                                value={userData.email} 
                                readOnly 
                                className="w-full bg-slate-950/30 border border-white/5 py-3.5 sm:py-4 pl-12 pr-10 rounded-2xl outline-none text-sm sm:text-base font-bold text-slate-500 cursor-not-allowed truncate" 
                            />
                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        </div>
                    </div>

                    <div className="pt-2 sm:pt-4 flex justify-start">
                        <button 
                            onClick={handleResetPasswordLink}
                            disabled={isSendingLink}
                            className={`flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-black text-amber-500 uppercase tracking-widest transition-all ${isSendingLink ? 'opacity-50 cursor-not-allowed' : 'hover:text-amber-400 active:scale-95'}`}
                        >
                            {isSendingLink ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} 
                            {isSendingLink ? 'Mengirim Link...' : 'Kirim Link Atur Ulang Kata Sandi'}
                        </button>
                    </div>
                </div>

                {/* TOAST MESSAGE */}
                {message && (
                    <div className={`mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-2xl text-[10px] sm:text-xs font-black tracking-widest uppercase flex items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5 sm:mt-0" /> : <X size={18} className="shrink-0 mt-0.5 sm:mt-0" />}
                        <span className="leading-relaxed">{message.text}</span>
                    </div>
                )}

                {/* EDIT MODE BUTTONS */}
                {editMode && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 max-w-xl mx-auto">
                        <button 
                            onClick={() => { setEditMode(false); setName(userData.name); setMessage(null); }} 
                            className="flex-1 py-3.5 sm:py-4 bg-white/5 border border-transparent rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white active:scale-95 transition-all"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={isLoading} 
                            className="flex-1 py-3.5 sm:py-4 bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-900 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_5px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.3)] flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Simpan Perubahan</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;