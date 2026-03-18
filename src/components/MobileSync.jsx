import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Smartphone, Monitor, Wifi, QrCode, Terminal, AlertTriangle } from 'lucide-react';

const MobileSync = () => {
    // State untuk menyimpan IP Address komputer
    const [ipAddress, setIpAddress] = useState('192.168.');
    const [frontendUrl, setFrontendUrl] = useState('');

    // Setiap IP berubah, otomatis perbarui URL
    useEffect(() => {
        setFrontendUrl(`http://${ipAddress}:5173`);
    }, [ipAddress]);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
                <div className="text-left text-white">
                    <h1 className="text-2xl sm:text-4xl font-black italic tracking-tight uppercase drop-shadow-md">Mobile Sync</h1>
                    <p className="text-[10px] sm:text-xs text-emerald-500 font-bold tracking-[0.3em] uppercase mt-2">Elite Device Testing</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* KOLOM KIRI: QR Code & Input IP */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Wifi size={200} />
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.2)] mb-8 relative z-10 transition-transform hover:scale-105 duration-300">
                        <QRCode 
                            value={frontendUrl} 
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#0f172a" // Warna Slate-900
                            level="H" // High error correction
                        />
                    </div>

                    <div className="w-full space-y-4 z-10">
                        <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase ml-2 tracking-widest flex items-center gap-2">
                            <Wifi size={14} className="text-emerald-500"/> Masukkan IP WiFi Komputer Anda
                        </label>
                        <input 
                            type="text" 
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                            placeholder="Contoh: 192.168.1.5"
                            className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-2xl outline-none text-center text-lg font-black text-emerald-400 focus:border-emerald-500 focus:bg-slate-900 shadow-inner transition-all tracking-widest" 
                        />
                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold mt-2">
                            Scan QR di atas menggunakan kamera HP Anda
                        </p>
                    </div>
                </div>

                {/* KOLOM KANAN: Panduan Terminal (Wajib Dilakukan) */}
                <div className="space-y-6">
                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-3">
                            <Terminal size={18}/> 1. Buka Akses Backend (Laravel)
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Matikan server Laravel Anda, lalu jalankan ulang dengan tambahan perintah <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">--host</span> agar bisa diakses dari HP:
                        </p>
                        <div className="bg-slate-950 border border-white/5 p-4 rounded-xl font-mono text-sm text-emerald-400 flex items-center gap-3">
                            <span className="text-slate-600">$</span> php artisan serve --host=0.0.0.0
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-3">
                            <Monitor size={18}/> 2. Buka Akses Frontend (React Vite)
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Matikan server React Anda, lalu jalankan ulang dengan tambahan <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">--host</span>:
                        </p>
                        <div className="bg-slate-950 border border-white/5 p-4 rounded-xl font-mono text-sm text-emerald-400 flex items-center gap-3">
                            <span className="text-slate-600">$</span> npm run dev -- --host
                        </div>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-6 flex items-start gap-4">
                        <AlertTriangle size={24} className="text-rose-500 shrink-0 mt-1"/>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Peringatan Penting</h4>
                            <p className="text-xs text-rose-500/80 leading-relaxed">
                                Pastikan HP dan Laptop/PC Anda terhubung ke <b>Jaringan WiFi yang sama</b>. Jika tidak, QR Code tidak akan bisa dibuka.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileSync;