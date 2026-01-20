
'use client';

import { useState } from 'react';
import { ASISummary } from '@/lib/asi';
import { Search, Activity, AlertOctagon, MapPin, Radio, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ASICharts from './ASICharts';

export default function ASIModule({ data }: { data: ASISummary }) {
    const [filter, setFilter] = useState<'All' | 'High' | 'Moderate' | 'Healthy'>('All');
    const [metricMode, setMetricMode] = useState<'Adult' | 'Child'>('Adult');
    const [search, setSearch] = useState('');

    // Dropdown States
    const [selectedMonth, setSelectedMonth] = useState<string>('All');
    const [selectedState, setSelectedState] = useState<string>('All');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

    // unique values for dropdowns
    const uniqueMonths = Array.from(new Set(data.entries.map(e => e.month))).sort();
    const uniqueStates = Array.from(new Set(data.entries.map(e => e.state))).sort();

    const uniqueDistricts = selectedState === 'All'
        ? Array.from(new Set(data.entries.map(e => e.district))).sort()
        : Array.from(new Set(data.entries.filter(e => e.state === selectedState).map(e => e.district))).sort();

    const filteredEntries = data.entries.filter(entry => {
        const matchesSearch = entry.pincode.includes(search) ||
            entry.district.toLowerCase().includes(search.toLowerCase()) ||
            entry.state.toLowerCase().includes(search.toLowerCase());

        const currentStress = metricMode === 'Adult' ? entry.stress_level_adult : entry.stress_level_child;
        const matchesFilter = filter === 'All' || currentStress === filter;
        const matchesMonth = selectedMonth === 'All' || entry.month === selectedMonth;
        const matchesState = selectedState === 'All' || entry.state === selectedState;
        const matchesDistrict = selectedDistrict === 'All' || entry.district === selectedDistrict;

        return matchesSearch && matchesFilter && matchesMonth && matchesState && matchesDistrict;
    });

    const displayEntries = filteredEntries.slice(0, 100);

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>

            {/* Hero Header */}
            <section className="hero-section">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex-center" style={{ flexDirection: 'column' }}>
                        <span className="status-badge">
                            <span className="pulse-dot"></span>
                            SYSTEM OPERATIONAL • V3.2.0
                        </span>

                        <h1 className="hero-title">
                            ASI PROTOCOL
                        </h1>

                        <p className="hero-subtitle">
                            Advanced Aadhaar Stress Intelligence. Real-time predictive analytics identifying operational bottlenecks across <span style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>{data.totalPincodes} locations</span>.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Control Grid */}
            <div className="grid-dashboard">

                {/* Radar Sidebar */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel radar-container"
                    style={{ display: 'flex', flexDirection: 'column', padding: 0 }}
                >
                    {/* Radar Visuals */}
                    <div className="radar-circle" style={{ width: '200px', height: '200px' }}></div>
                    <div className="radar-circle" style={{ width: '140px', height: '140px' }}></div>
                    <div className="radar-circle" style={{ width: '80px', height: '80px', background: 'rgba(59,130,246,0.1)' }}></div>
                    <div className="radar-sweep"></div>

                    <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: '-40px' }}>
                        <div className="kpi-value" style={{ fontSize: '2rem' }}>{data.totalPincodes}</div>
                        <div className="kpi-label">Nodes Active</div>
                    </div>
                </motion.div>

                {/* Main KPI Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Top KPIs Row */}
                    <div className="grid-cols-3">

                        <motion.div className="glass-panel kpi-card" whileHover={{ y: -5 }}>
                            <div className="flex-between">
                                <span className="kpi-label">Critical Zones</span>
                                <AlertOctagon size={24} color="#ef4444" />
                            </div>
                            <div className="kpi-value" style={{ color: '#ef4444' }}>{data.highStressPincodes}</div>
                            <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Immediate Intervention</div>
                        </motion.div>

                        <motion.div className="glass-panel kpi-card" whileHover={{ y: -5 }}>
                            <div className="flex-between">
                                <span className="kpi-label">System Health</span>
                                <ShieldCheck size={24} color="#10b981" />
                            </div>
                            {/* Use totalRecords for correct percentage */}
                            <div className="kpi-value">{(100 - (data.highStressPincodes / data.totalRecords * 100)).toFixed(1)}%</div>
                            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Operational Efficiency</div>
                        </motion.div>

                        <motion.div className="glass-panel kpi-card" style={{ borderColor: metricMode === 'Adult' ? 'rgba(59,130,246,0.5)' : 'rgba(139,92,246,0.5)' }}>
                            <div className="flex-between">
                                <span className="kpi-label">Current Metric</span>
                                <Activity size={24} color={metricMode === 'Adult' ? '#3b82f6' : '#8b5cf6'} />
                            </div>
                            <div className="kpi-value" style={{ fontSize: '2rem' }}>
                                {metricMode === 'Adult' ? 'Adult Stress' : 'Child Stress'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                Avg: {metricMode === 'Adult' ? data.averageASIAdult : data.averageASIChild}
                            </div>
                        </motion.div>

                    </div>

                    {/* Charts Area */}
                    <ASICharts data={data} />
                </div>

            </div>

            {/* Data Monitor */}
            <section className="glass-panel" style={{ padding: 0, marginTop: '2rem' }}>

                {/* Filter Toolbar - New Systematic Design */}
                <div className="control-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1.5rem' }}>

                    {/* Row 1: Dropdowns */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Metric Type</label>
                        <select
                            value={metricMode}
                            onChange={(e) => setMetricMode(e.target.value as any)}
                            className="search-input" style={{ cursor: 'pointer' }}
                        >
                            <option value="Adult">Adult Stress Index</option>
                            <option value="Child">Child Stress Index</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="search-input" style={{ cursor: 'pointer' }}
                        >
                            <option value="All">All Months</option>
                            {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>State</label>
                        <select
                            value={selectedState}
                            onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict('All'); }}
                            className="search-input" style={{ cursor: 'pointer' }}
                        >
                            <option value="All">All States</option>
                            {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>District</label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="search-input" style={{ cursor: 'pointer' }}
                            disabled={selectedState === 'All' && uniqueDistricts.length > 100}
                        >
                            <option value="All">All Districts</option>
                            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Search */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 1' }}>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Search</label>
                        <input
                            type="text"
                            placeholder="Pincode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Status filters */}
                    <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem' }}>
                        {['All', 'High'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                style={{ height: '42px', flex: 1 }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Data Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Pincode</th>
                                <th>District</th>
                                <th>State</th>
                                <th style={{ textAlign: 'right' }}>ASI Score ({metricMode})</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th>Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {displayEntries.map((entry, idx) => {
                                    const score = metricMode === 'Adult' ? entry.asi_adult : entry.asi_child;
                                    const status = metricMode === 'Adult' ? entry.stress_level_adult : entry.stress_level_child;

                                    return (
                                        <motion.tr
                                            key={`${entry.pincode}-${entry.month}-${idx}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                                {entry.month}
                                            </td>
                                            <td>
                                                <span style={{
                                                    color: '#60a5fa',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    fontFamily: 'monospace',
                                                    fontWeight: 'bold',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                                }}>
                                                    {entry.pincode}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '600', color: '#fff' }}>
                                                {entry.district}
                                            </td>
                                            <td style={{ color: '#94a3b8' }}>
                                                {entry.state}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: score > 5 ? '#ef4444' : score > 2 ? '#f59e0b' : '#10b981' }}>
                                                {score.toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`badge ${status === 'High' ? 'badge-high' : status === 'Moderate' ? 'badge-mod' : 'badge-ok'}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td>
                                                {status === 'High' ? (
                                                    <button className="action-btn">
                                                        Deploy Units
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Standby</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredEntries.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            No Data Found matching your filters.
                        </div>
                    )}

                    {filteredEntries.length > 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.8rem' }}>
                            Showing Top {displayEntries.length} Records
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}
