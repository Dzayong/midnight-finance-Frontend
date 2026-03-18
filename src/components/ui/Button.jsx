import React from 'react';

/**
 * GoldButton - Komponen Tombol Mewah Nuansa Emas
 * @param {Object} props - children, onClick, className, variant
 */
export const GoldButton = ({ children, onClick, className = "", variant = "primary" }) => {
    // Base Style: Mewah, Tracking Lebar, UpperCase
    const baseStyle = "px-6 py-3 rounded-2xl font-black transition-all duration-500 transform active:scale-95 flex items-center justify-center gap-3 tracking-[0.15em] uppercase text-[10px] shadow-2xl";
    
    const variants = {
        // Varian Emas Menyala (Main Action)
        primary: "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-900 shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-1 hover:brightness-110",
        
        // Varian Garis Tipis (Secondary Action)
        outline: "border border-amber-500/30 text-amber-500 hover:bg-amber-500/5 hover:border-amber-500",
        
        // Varian Hantu (Tertiary Action)
        ghost: "text-slate-500 hover:text-white transition-colors"
    };

    return (
        <button 
            onClick={onClick} 
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

// Kalau mau nambah tombol varian lain tinggal export lagi di bawah sini