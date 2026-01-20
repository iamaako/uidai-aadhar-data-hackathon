'use client';

import { useState, useEffect, useMemo } from 'react';
import { AadhaarRecord, fetchMonthData, MONTHS } from '@/lib/data-service';
import { Search, MapPin, Users, Fingerprint, FileText, ChevronDown, Filter, List, Map as MapIcon, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapWrapper from './MapWrapper';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
    const [data, setData] = useState<AadhaarRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchPincode, setSearchPincode] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    // UI State
    const [selectedRecord, setSelectedRecord] = useState<AadhaarRecord | null>(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [mapPopupState, setMapPopupState] = useState<string | null>(null); // Selected state in Map Modal

    useEffect(() => {
        setLoading(true);
        fetchMonthData(selectedMonth).then((records) => {
            setData(records);
            setLoading(false);
            setSelectedRecord(null);
            setSelectedState('');
            setSelectedDistrict('');
        });
    }, [selectedMonth]);

    // Derived Filter Lists
    const states = useMemo(() => {
        const s = new Set(data.map(d => d.state).filter(Boolean));
        return Array.from(s).sort();
    }, [data]);

    const districts = useMemo(() => {
        if (!selectedState) return [];
        const d = new Set(data.filter(r => r.state === selectedState).map(r => r.district).filter(Boolean));
        return Array.from(d).sort();
    }, [data, selectedState]);

    // Filtered Data for Table
    const filteredData = useMemo(() => {
        return data.filter(r => {
            const matchState = selectedState ? r.state === selectedState : true;
            const matchDistrict = selectedDistrict ? r.district === selectedDistrict : true;
            const matchPincode = searchPincode ? r.pincode.includes(searchPincode) : true;
            return matchState && matchDistrict && matchPincode;
        });
    }, [data, selectedState, selectedDistrict, searchPincode]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredData.length === 1) {
            setSelectedRecord(filteredData[0]);
        } else if (searchPincode && filteredData.length > 0) {
            const exact = filteredData.find(r => r.pincode === searchPincode);
            if (exact) setSelectedRecord(exact);
        }
    };

    const handleMapStateSelect = (stateName: string) => {
        setMapPopupState(stateName);
    };

    const confirmMapSelection = () => {
        if (mapPopupState) {
            setSelectedState(mapPopupState);
            setSelectedDistrict('');
            setIsMapOpen(false);
            setMapPopupState(null);
        }
    };

    // Stats Logic
    const currentStats = useMemo(() => {
        const source = filteredData.length > 0 ? filteredData : data;
        return {
            enrolment: source.reduce((acc, curr) => acc + (curr.data.enrolment.age_0_5 + curr.data.enrolment.age_5_17 + curr.data.enrolment.age_18_above), 0),
            bioUpdates: source.reduce((acc, curr) => acc + (curr.data.biometric_update.age_5_17 + curr.data.biometric_update.age_17_above), 0),
            demoUpdates: source.reduce((acc, curr) => acc + (curr.data.demographic_update.age_5_17 + curr.data.demographic_update.age_17_above), 0)
        };
    }, [filteredData, data]);


    const chartData = selectedRecord ? [
        { name: 'Enrolment', value: selectedRecord.data.enrolment.age_0_5 + selectedRecord.data.enrolment.age_5_17 + selectedRecord.data.enrolment.age_18_above },
        { name: 'Biometric', value: selectedRecord.data.biometric_update.age_5_17 + selectedRecord.data.biometric_update.age_17_above },
        { name: 'Demographic', value: selectedRecord.data.demographic_update.age_5_17 + selectedRecord.data.demographic_update.age_17_above },
    ] : [];

    const pieData = selectedRecord ? [
        { name: '0-5 Yrs', value: selectedRecord.data.enrolment.age_0_5 },
        { name: '5-17 Yrs', value: selectedRecord.data.enrolment.age_5_17 },
        { name: '18+ Yrs', value: selectedRecord.data.enrolment.age_18_above },
    ] : [];

    const COLORS = ['#10B981', '#F59E0B', '#6366F1'];

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-20 relative">

            {/* Navbar with Glass Effect */}
            <nav className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Fingerprint className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">UIDAI Analytics</h1>
                        <p className="text-xs text-slate-400">Data Hackathon 2026 Dashboard</p>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-8">

                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Enrolments"
                        value={loading ? '...' : currentStats.enrolment.toLocaleString()}
                        icon={<Users className="w-6 h-6 text-white" />}
                        gradient="from-emerald-500 to-teal-600"
                    />
                    <StatCard
                        title="Biometric Updates"
                        value={loading ? '...' : currentStats.bioUpdates.toLocaleString()}
                        icon={<Fingerprint className="w-6 h-6 text-white" />}
                        gradient="from-indigo-500 to-blue-600"
                    />
                    <StatCard
                        title="Demographic Updates"
                        value={loading ? '...' : currentStats.demoUpdates.toLocaleString()}
                        icon={<FileText className="w-6 h-6 text-white" />}
                        gradient="from-purple-500 to-pink-600"
                    />
                </div>

                {/* Filters Section */}
                <div className="bg-[#131B2C] border border-white/5 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Filter size={18} />
                        <span className="text-sm font-medium">Filter Data:</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <FilterDropdown
                            label="Month"
                            value={selectedMonth}
                            options={MONTHS}
                            onChange={setSelectedMonth}
                            formatOption={(m: string) => new Date(m).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        />

                        <FilterDropdown
                            label="State"
                            value={selectedState}
                            options={states}
                            onChange={(val: string) => { setSelectedState(val); setSelectedDistrict(''); }}
                            placeholder="All States"
                        />

                        <FilterDropdown
                            label="District"
                            value={selectedDistrict}
                            options={districts}
                            onChange={setSelectedDistrict}
                            placeholder="All Districts"
                            disabled={!selectedState}
                        />
                    </div>
                </div>
                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <form onSubmit={handleSearch} className="flex-1 w-full max-w-2xl relative group">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition duration-300" />
                        <div className="relative flex items-center bg-[#131B2C] border border-white/10 rounded-xl p-1 shadow-2xl">
                            <Search className="w-5 h-5 text-slate-400 ml-4 mr-3" />
                            <input
                                type="text"
                                placeholder="Search by Pincode..."
                                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none py-3"
                                value={searchPincode}
                                onChange={(e) => setSearchPincode(e.target.value)}
                            />
                        </div>
                    </form>

                    <button
                        onClick={() => setIsMapOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                    >
                        <MapIcon className="w-5 h-5" /> Explore Map
                    </button>
                </div>

                {/* Main Content: List & Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Data Table */}
                    <div className="lg:col-span-4 flex flex-col h-[600px] bg-[#131B2C] border border-white/5 rounded-3xl overflow-hidden shadow-xl relative">
                        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-200">
                                Pincodes {filteredData.length > 0 && <span className="text-xs ml-2 bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{filteredData.length.toLocaleString()}</span>}
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {loading ? (
                                <div className="text-center p-10 text-slate-500">Loading data...</div>
                            ) : filteredData.length === 0 ? (
                                <div className="text-center p-10 text-slate-500">No matching records found</div>
                            ) : (
                                filteredData.slice(0, 50).map((record) => (
                                    <div
                                        key={record.pincode}
                                        onClick={() => setSelectedRecord(record)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedRecord?.pincode === record.pincode
                                            ? 'bg-indigo-600/20 border-indigo-500/50 shadow-inner'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-mono text-lg font-bold text-white">{record.pincode}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-black/20 px-2 py-1 rounded">
                                                {record.district}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 truncate">
                                            {record.locations.slice(0, 3).join(', ')} {record.locations.length > 3 && `+${record.locations.length - 3} more`}
                                            {record.locations.length === 0 && record.state}
                                        </div>
                                    </div>
                                ))
                            )}
                            {filteredData.length > 50 && (
                                <div className="text-center py-4 text-xs text-slate-500 italic border-t border-white/5 mt-2">
                                    Showing top 50 matches. Use filters or search to narrow down.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Detailed Analysis */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode='wait'>
                            {selectedRecord ? (
                                <motion.div
                                    key={selectedRecord.pincode}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Header Card */}
                                    <div className="bg-[#1AE097]/5 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <MapPin size={120} className="text-emerald-500" />
                                        </div>
                                        <h2 className="text-4xl font-bold text-white mb-2">{selectedRecord.district}</h2>
                                        <p className="text-emerald-400 font-medium mb-6 flex items-center gap-2">
                                            <MapPin size={16} /> {selectedRecord.state} - {selectedRecord.pincode}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedRecord.locations.map(loc => (
                                                <span key={loc} className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">
                                                    {loc}
                                                </span>
                                            ))}
                                            {selectedRecord.locations.length === 0 && <span className="text-xs text-emerald-500/50 italic">No specific location tags</span>}
                                        </div>
                                    </div>

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#131B2C] border border-white/5 rounded-3xl p-6 shadow-xl h-[350px] flex flex-col">
                                            <h3 className="text-slate-300 font-semibold mb-4">Activity Breakdown</h3>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                                    <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                                        {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="bg-[#131B2C] border border-white/5 rounded-3xl p-6 shadow-xl h-[350px] flex flex-col">
                                            <h3 className="text-slate-300 font-semibold mb-4">Age Demographics</h3>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                        {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                </motion.div>
                            ) : (
                                <div className="h-[600px] flex flex-col items-center justify-center text-slate-500 bg-[#131B2C]/50 border border-white/5 rounded-3xl border-dashed">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Select a Pincode from the list</p>
                                    <p className="text-sm opacity-60">or click "Explore Map" to find your state</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* FULL SCREEN MAP MODAL */}
            <AnimatePresence>
                {isMapOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                    >
                        <div className="w-full h-full max-w-6xl max-h-[85vh] bg-[#0B0F19] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col">

                            {/* Modal Header */}
                            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-[#131B2C]">
                                <div>
                                    <h2 className="text-2xl font-bold">Interactive Map</h2>
                                    <p className="text-slate-400 text-sm">Select a state to filter dashboard data</p>
                                </div>
                                <button onClick={() => setIsMapOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Map Content */}
                            <div className="flex-1 relative bg-[#05080f]">
                                <MapWrapper onStateSelect={handleMapStateSelect} />

                                {/* ZOOMABLE POPUP inside Map Container */}
                                <AnimatePresence>
                                    {mapPopupState && (
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1e293b] border border-indigo-500/50 p-6 rounded-2xl shadow-2xl min-w-[300px] z-50 text-center"
                                        >
                                            <h3 className="text-2xl font-bold mb-1 text-white">{mapPopupState}</h3>
                                            <p className="text-slate-400 text-sm mb-4">View detailed analytics for this state</p>

                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={() => setMapPopupState(null)}
                                                    className="px-4 py-2 rounded-xl text-slate-300 font-medium hover:bg-white/5 transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={confirmMapSelection}
                                                    className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                                                >
                                                    View Data <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

function StatCard({ title, value, icon, gradient }: { title: string, value: string, icon: any, gradient: string }) {
    return (
        <div className="bg-[#131B2C] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-[#182235] transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl -mr-8 -mt-8`} />
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}>{icon}</div>
            </div>
            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-0.5">{value}</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
            </div>
        </div>
    );
}

function FilterDropdown({ label, value, options, onChange, placeholder, disabled, formatOption }: { label: string, value: string, options: string[], onChange: (value: string) => void, placeholder?: string, disabled?: boolean, formatOption?: (option: string) => string }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="appearance-none bg-[#131B2C] border border-white/10 hover:border-indigo-500/50 text-slate-200 pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all w-[140px] md:w-[160px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>
                        {formatOption ? formatOption(opt) : opt}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
    )
}
