import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
    Activity, PieChart as PieIcon, Loader2, TrendingUp, TrendingDown, 
    Wallet, Target, Zap, ArrowUpRight, Info
} from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState({ line_chart: [], pie_chart: [], stats: {} });
    const [isLoading, setIsLoading] = useState(true);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${baseURL}/analytics`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
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
                        savings_rate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0
                    }
                });
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [baseURL]);

    const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

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
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Surplus/Defisit (7 Hari)</p>
                            <h3 className={`text-xl font-black italic ${data.stats.net_flow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                Rp {data.stats.net_flow.toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Wallet size={18}/></div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Bocoran Alus (Terbesar)</p>
                            <h3 className="text-xl font-black italic text-white uppercase truncate w-[150px]">{data.stats.top_spending.name}</h3>
                            <p className="text-[10px] font-bold text-rose-500 mt-0.5 font-mono">Rp {data.stats.top_spending.total.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500"><Zap size={18}/></div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Savings Rate</p>
                            <h3 className="text-xl font-black italic text-amber-500 font-mono">{data.stats.savings_rate}%</h3>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5 italic uppercase">Aset Terselamatkan</p>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Target size={18}/></div>
                    </div>
                </div>
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. LINE CHART: ARUS KAS */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Activity className="text-amber-500" size={18} />
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arus Kas (7 Hari)</h2>
                            </div>
                            <div className="flex gap-4 text-[9px] font-bold uppercase">
                                <span className="flex items-center gap-1 text-emerald-500"><ArrowUpRight size={12}/> Masuk</span>
                                <span className="flex items-center gap-1 text-rose-500 opacity-50"><TrendingDown size={12}/> Keluar</span>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.line_chart}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#334155" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('id-ID', {day:'numeric', month:'short'})} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', fontSize: '10px'}} 
                                        itemStyle={{fontWeight: 'black', textTransform: 'uppercase'}}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} connectNulls={true} dot={{ r: 4, fill: '#10b981' }} />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" connectNulls={true} dot={{ r: 3, fill: '#ef4444' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* INSIGHT KHUSUS GARIS */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
                        <div className="flex gap-3">
                            <div className="mt-1"><Info size={14} className="text-emerald-500" /></div>
                            <p className="text-[11px] leading-relaxed text-slate-400">
                                <strong className="text-white uppercase tracking-tighter italic">Analisis Arus Kas:</strong> Pastikan garis <span className="text-emerald-500 font-bold">Hijau (Masuk)</span> selalu berada di atas garis <span className="text-rose-500 font-bold">Merah (Keluar)</span>. Jika garis merah melompat lebih tinggi, portofolio Abang sedang mengalami defisit harian.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. PIE CHART: ALOKASI KATEGORI */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <PieIcon className="text-amber-500" size={18} />
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alokasi Pengeluaran</h2>
                        </div>
                        {data.pie_chart.length > 0 ? (
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="h-[180px] w-full md:w-1/2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={data.pie_chart} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={8}>
                                                {data.pie_chart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-1 gap-3 w-full md:w-1/2">
                                    {data.pie_chart.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase">{item.name}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-white font-mono">Rp {item.total.toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[180px] flex items-center justify-center italic text-slate-600 text-[10px] uppercase font-black">Data Kosong</div>
                        )}
                    </div>
                    {/* INSIGHT KHUSUS PIE */}
                    <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl">
                        <div className="flex gap-3">
                            <div className="mt-1"><Target size={14} className="text-amber-500" /></div>
                            <p className="text-[11px] leading-relaxed text-slate-400">
                                <strong className="text-white uppercase tracking-tighter italic">Analisis Alokasi:</strong> Perhatikan potongan terbesar. Jika satu kategori mendominasi lebih dari 50% lingkaran, evaluasi apakah itu <span className="text-amber-500 font-bold underline decoration-amber-500/30">Investasi atau Gaya Hidup</span>. Jaga komposisi pengeluaran tetap seimbang.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;