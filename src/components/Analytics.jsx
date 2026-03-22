import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { 
    Activity, PieChart as PieIcon, Loader2, TrendingUp, 
    Wallet, Target, Zap, Info, ChevronDown, PiggyBank 
} from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState({ line_chart: [], pie_chart: [], savings: [], stats: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSavingId, setSelectedSavingId] = useState(''); // State untuk filter tabungan

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${baseURL}/analytics`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                const savings = res.data.savings || [];
                const totalIncome = res.data.line_chart.reduce((acc, curr) => acc + curr.income, 0);
                const totalExpense = res.data.line_chart.reduce((acc, curr) => acc + curr.expense, 0);
                const topCategory = res.data.pie_chart.length > 0 
                    ? [...res.data.pie_chart].sort((a, b) => b.total - a.total)[0] 
                    : { name: '-', total: 0 };

                setData({
                    ...res.data,
                    stats: {
                        net_flow: totalIncome - totalExpense,
                        top_spending: topCategory,
                        savings_rate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
                        total_savings: savings.reduce((acc, curr) => acc + Number(curr.current_amount), 0)
                    }
                });

                // Default pilih tabungan pertama jika ada
                if (savings.length > 0) setSelectedSavingId(savings[0].id);

            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [baseURL, token]);

    const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

    const formatRupiah = (val) => `Rp ${Math.floor(Number(val)).toLocaleString('id-ID')}`;

    // DATA UNTUK GRAFIK TABUNGAN SPESIFIK
    const selectedSaving = data.savings.find(s => s.id.toString() === selectedSavingId.toString());
    const singleSavingData = selectedSaving ? [
        { name: 'Terkumpul', amount: Number(selectedSaving.current_amount), fill: '#10b981' },
        { name: 'Target', amount: Number(selectedSaving.target_amount), fill: '#1e293b' }
    ] : [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-950/90 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-6 my-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }}></span>
                                <span className="text-[10px] font-bold text-white uppercase">{entry.name}:</span>
                            </div>
                            <span className="text-xs font-black italic text-white font-mono">{formatRupiah(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-amber-500" size={40} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Mengkalkulasi Aset...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
            <div>
                <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Analisis Kekayaan</h1>
                <p className="text-[10px] text-emerald-500 font-bold tracking-[0.3em] uppercase mt-2">Insight Sultan & Visualisasi Arus Kas</p>
            </div>

            {/* --- INSIGHT CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Dana Terkunci (Tabungan)</p>
                    <h3 className="text-xl font-black italic text-emerald-400">{formatRupiah(data.stats.total_savings)}</h3>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-xl flex justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Bocoran Alus</p>
                        <h3 className="text-xl font-black italic text-white uppercase truncate max-w-[120px]">{data.stats.top_spending.name}</h3>
                    </div>
                    <Zap className="text-rose-500 opacity-30" size={24}/>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Savings Rate</p>
                    <h3 className="text-xl font-black italic text-amber-500 font-mono">{data.stats.savings_rate}%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. GRAFIK ARUS KAS */}
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="text-amber-500" size={18} />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arus Kas (7 Hari)</h2>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.line_chart} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#334155" fontSize={9} axisLine={false} tickLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('id-ID', {day:'numeric', month:'short'})} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" name="Masuk" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                <Area type="monotone" name="Keluar" dataKey="expense" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#ef4444' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 💡 2. FITUR BARU: GRAFIK TRACKING TABUNGAN BERDASARKAN PILIHAN */}
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <PiggyBank className="text-emerald-500" size={18} />
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress Per Target</h2>
                        </div>
                        
                        {/* DROPDOWN PILIH TABUNGAN */}
                        <div className="relative">
                            <select 
                                value={selectedSavingId} 
                                onChange={(e) => setSelectedSavingId(e.target.value)}
                                className="bg-slate-950 border border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-[9px] font-black uppercase text-white outline-none appearance-none cursor-pointer focus:border-emerald-500 transition-colors"
                            >
                                {data.savings.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                {data.savings.length === 0 && <option>Belum ada data</option>}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {selectedSaving ? (
                        <div className="flex flex-col gap-6">
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={singleSavingData} layout="vertical" margin={{ left: -20 }}>
                                        <XAxis type="number" hide domain={[0, Number(selectedSaving.target_amount)]} />
                                        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={80} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="amount" radius={[0, 10, 10, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Kekurangan Dana</p>
                                    <p className="text-sm font-black text-rose-500 italic">
                                        {formatRupiah(selectedSaving.target_amount - selectedSaving.current_amount)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Persentase</p>
                                    <p className="text-sm font-black text-emerald-500 italic">
                                        {Math.round((selectedSaving.current_amount / selectedSaving.target_amount) * 100)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center opacity-30 italic text-[10px] uppercase font-black tracking-widest">
                            Pilih atau buat tabungan dulu, Cok!
                        </div>
                    )}
                </div>

                {/* 3. ALOKASI PENGELUARAN (PIE) */}
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <PieIcon className="text-amber-500" size={18} />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alokasi Dana Keluar</h2>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-[180px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data.pie_chart} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={8}>
                                        {data.pie_chart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-1/2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.pie_chart.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase truncate max-w-[100px]">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white font-mono shrink-0">{formatRupiah(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. TIPS ANALISIS */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] flex flex-col justify-center">
                    <div className="flex gap-4">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 h-fit"><Target size={24} /></div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase italic mb-2 tracking-wider">Strategi Pertumbuhan Aset</h3>
                            <p className="text-[11px] leading-relaxed text-slate-400">
                                Berdasarkan data 7 hari terakhir, tingkat <span className="text-amber-500 font-bold">Savings Rate</span> Abang berada di angka <span className="text-amber-500 font-bold">{data.stats.savings_rate}%</span>. 
                                Gunakan fitur <span className="text-emerald-500 font-bold italic">Progress Per Target</span> di atas untuk memantau tabungan mana yang paling mendekati cair. Ingat, Sultan yang cerdas adalah Sultan yang tahu kemana setiap perak uangnya pergi!
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;