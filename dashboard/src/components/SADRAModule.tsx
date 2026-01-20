
'use client';

import { useState } from 'react';
import { SADRASummary } from '@/lib/sadra';
import { TrendingUp, TrendingDown, ArrowRight, Truck, BrainCircuit, CalendarClock, Zap, Map as MapIcon, CloudRain, Tent, AlertTriangle, Navigation, LocateFixed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEASONAL_CONTEXT: Record<string, { event: string, type: 'warning' | 'info' | 'critical' }> = {
    'January': { event: 'Republic Day Security - Urban Centers High Alert', type: 'info' },
    'February': { event: 'Board Exam Prep - Student Updates Surge', type: 'warning' },
    'March': { event: 'Financial Year End - Commercial Updates High', type: 'info' },
    'April': { event: 'Rabi Harvest - Rural Workforce Availability Low', type: 'warning' },
    'May': { event: 'Heatwave Alert - Afternoon Footfall Drop Expected', type: 'critical' },
    'June': { event: 'Monsoon Onset - Hill District Logistics Compromised', type: 'critical' },
    'July': { event: 'Heavy Rainfall - Coastal Connectivity Risk', type: 'critical' },
    'August': { event: 'Independence Day - High Administrative Load', type: 'info' },
    'September': { event: 'Kharif Harvest - Rural Demand Low', type: 'info' },
    'October': { event: 'Festival Season - Public Holidays Impact', type: 'warning' },
    'November': { event: 'Post-Festival Wedding Season - Name Change Spikes', type: 'warning' },
    'December': { event: 'Winter Break - School Camp Opportunity', type: 'info' },
};

export default function SADRAModule({ data }: { data: SADRASummary }) {
    // Sort months strictly (assuming format YYYY-MM or similar sortable string, but user data seems to use "2025-03" etc.)
    // If keys vary, standard sort works for ISO dates strings.
    const months = Object.keys(data.monthlyData).sort();
    const [selectedMonth, setSelectedMonth] = useState(months[0] || '');
    const [search, setSearch] = useState('');

    const currentMonthData = data.monthlyData[selectedMonth] || [];

    // Parse month name to match SEASONAL_CONTEXT keys if needed, assuming keys are "2025-03"
    // We need to map "2025-03" to "March".
    const getMonthName = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + "-01"); // Append day to make valid
        return d.toLocaleString('default', { month: 'long' });
    };

    const monthName = getMonthName(selectedMonth);
    const context = SEASONAL_CONTEXT[monthName] || { event: 'Normal Operations', type: 'info' };

    const filteredData = currentMonthData.filter(d =>
        d.district.toLowerCase().includes(search.toLowerCase()) ||
        d.state.toLowerCase().includes(search.toLowerCase())
    );

    const peakDistricts = currentMonthData.filter(d => d.status === 'Peak Demand').length;
    const lowDistricts = currentMonthData.filter(d => d.status === 'Low Demand').length;

    // Calculate "Optimization Score"
    const optimizationScore = Math.min(98.5, 85 + (lowDistricts / data.totalDistricts * 20)).toFixed(1);

    return (
        <div className="container" style={{ paddingBottom: '6rem', maxWidth: '1600px' }}>

            {/* Simulation Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
                    paddingBottom: '1rem'
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <BrainCircuit size={32} color="#a78bfa" />
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            letterSpacing: '-0.03em',
                            background: 'linear-gradient(to right, #fff, #c4b5fd)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            S.A.D.R.A.
                        </h1>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Seasonal Aadhaar Demand & Resource Allocator
                    </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div className="status-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}>
                        <div className="pulse-dot" style={{ background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }}></div>
                        PREDICTIVE ENGINE ONLINE
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Analyzing {data.totalDistricts} Zones across India
                    </div>
                </div>
            </motion.div>

            {/* Timeline Navigator */}
            <div className="glass-panel" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(0,0,0,0) 100%)',
                borderColor: 'rgba(139, 92, 246, 0.2)'
            }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h3 className="kpi-label" style={{ color: '#c4b5fd' }}><CalendarClock size={16} style={{ display: 'inline', marginRight: '6px' }} /> Temporal Planning Horizon</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select future window to simulate demand</span>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '0.8rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                }}>
                    {months.map((m) => (
                        <motion.button
                            key={m}
                            onClick={() => setSelectedMonth(m)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '16px',
                                background: selectedMonth === m ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'rgba(255,255,255,0.03)',
                                border: selectedMonth === m ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.08)',
                                color: 'white',
                                minWidth: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                boxShadow: selectedMonth === m ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {selectedMonth === m && (
                                <motion.div
                                    layoutId="activeGlow"
                                    style={{
                                        position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)', opacity: 0.5
                                    }}
                                />
                            )}
                            <span style={{ fontSize: '0.8rem', color: selectedMonth === m ? 'rgba(255,255,255,0.8)' : '#64748b', fontWeight: '500' }}>2025</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.05em' }}>{m}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Operations Center Row (NEW) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* 1. Context & Weather Overlay */}
                <motion.div
                    className="glass-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        background: context.type === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 41, 59, 0.6)',
                        borderColor: context.type === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)'
                    }}
                >
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <h3 className="kpi-label" style={{ color: context.type === 'critical' ? '#fca5a5' : '#fff' }}>
                            <CloudRain size={16} style={{ display: 'inline', marginRight: '6px' }} /> MISSION CONTEXT
                        </h3>
                        {context.type === 'critical' && <AlertTriangle size={20} color="#ef4444" className="pulse-icon" />}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                        {context.event}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                        AI detects seasonal patterns affecting logistics.
                        {context.type === 'critical'
                            ? ' Immediate route optimization required for hill/coastal areas.'
                            : ' Standard operational procedures apply.'}
                    </div>
                </motion.div>

                {/* 2. Logistics Route Planner */}
                <motion.div className="glass-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <h3 className="kpi-label"><MapIcon size={16} style={{ display: 'inline', marginRight: '6px' }} /> ACTIVE LOGISTICS ROUTES</h3>
                        <span className="status-badge" style={{ fontSize: '0.7rem' }}>LIVE TRACKING</span>
                    </div>

                    {/* Fake Map / Route List */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                                    <span>TRUCK-0{i}8{i}</span>
                                    <span style={{ color: '#10b981' }}>In Transit</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <span>Dist. A</span>
                                    <ArrowRight size={14} color="#64748b" />
                                    <span>Dist. B</span>
                                </div>
                                <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: '10%' }}
                                        animate={{ width: `${30 + i * 20}%` }}
                                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                                        style={{ height: '100%', background: '#8b5cf6' }}
                                    />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>ETA: {i + 1}h 30m</span>
                                    <span><Navigation size={10} style={{ display: 'inline' }} /> 1{i}0 km</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="grid-dashboard">

                {/* Left: Stats & Budget */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Stats Card */}
                    <motion.div className="glass-panel" layout>
                        <h3 className="kpi-label" style={{ marginBottom: '1rem' }}><Zap size={16} style={{ display: 'inline', marginRight: '6px' }} /> DEMAND FORECAST</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f87171' }}>{peakDistricts}</div>
                                <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>CRITICAL ZONES</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>{lowDistricts}</div>
                                <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>SURPLUS ZONES</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Budget Saver (Calculated) */}
                    <motion.div
                        className="glass-panel"
                        layout
                        style={{ border: '1px solid #eab308' }}
                    >
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <span className="kpi-label" style={{ color: '#fde047' }}>Est. Cost Efficiency</span>
                            <span className="status-badge" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', borderColor: '#fde047', fontSize: '0.7rem' }}>ROI PROJECTION</span>
                        </div>
                        {(() => {
                            const kitsToMove = Math.floor(peakDistricts * 1.5);
                            const netBenefit = (kitsToMove * 150000) - (kitsToMove * 5000);
                            return (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Funds Saved</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>₹{(netBenefit / 100000).toFixed(2)} L</span>
                                    </div>
                                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '0.8rem' }}>
                                        <div style={{ height: '100%', width: '92%', background: '#eab308', borderRadius: '3px' }}></div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                                        Reallocating <strong>{kitsToMove} kits</strong> avoids new procurement, saving <strong>₹{(netBenefit / 100000).toFixed(1)} Lakhs</strong>.
                                    </p>
                                </div>
                            );
                        })()}
                    </motion.div>
                </div>

                {/* Right: Tactical Grid with Mobile Camp Logic */}
                <div className="glass-panel" style={{ padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className="control-bar flex-between" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', marginBottom: '1.5rem', backdropFilter: 'blur(20px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <LocateFixed size={20} color="#eab308" />
                            <h3 style={{ fontWeight: 'bold', letterSpacing: '0.05em', color: '#e2e8f0' }}>TACTICAL MAP</h3>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Zone Coordinates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                            style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        <AnimatePresence mode="wait">
                            {filteredData.map((entry, idx) => {
                                // 3. Mobile Camp Logic: Extreme demand (> 1.5 index) = Mobile Camp
                                const isMobileCampNeeded = entry.seasonal_index > 1.5;
                                const recommendationText = isMobileCampNeeded
                                    ? `Deploy Mobile Camp (7 Days)`
                                    : entry.recommendation.replace('Increase capacity:', 'Deploy').replace('Resource Surplus:', 'Surplus');

                                return (
                                    <motion.div
                                        key={entry.district + selectedMonth} // Key change forces re-render
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                                        transition={{ duration: 0.2 }}
                                        className="glass-panel"
                                        style={{
                                            padding: '1.25rem',
                                            background: entry.status === 'Peak Demand' ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.8))'
                                                : entry.status === 'Low Demand' ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.05), rgba(15, 23, 42, 0.8))'
                                                    : 'rgba(30, 41, 59, 0.6)',
                                            border: entry.status === 'Peak Demand' ? '1px solid rgba(239, 68, 68, 0.4)'
                                                : entry.status === 'Low Demand' ? '1px solid rgba(16, 185, 129, 0.3)'
                                                    : '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Mobile Camp Badge */}
                                        {isMobileCampNeeded && (
                                            <div style={{ position: 'absolute', top: 0, right: 0, background: '#f59e0b', color: '#000', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 8px', borderBottomLeftRadius: '8px' }}>
                                                CAMP REQ.
                                            </div>
                                        )}

                                        <div className="flex-between" style={{ marginBottom: '0.8rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{entry.state}</span>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                background: entry.status === 'Peak Demand' ? '#ef4444' : entry.status === 'Low Demand' ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                color: entry.status === 'Normal' ? '#94a3b8' : '#000'
                                            }}>
                                                {entry.seasonal_index.toFixed(2)}x LOAD
                                            </span>
                                        </div>

                                        <h3 style={{ color: '#fff', margin: '0.8rem 0 0.5rem 0', fontSize: '1.3rem', letterSpacing: '-0.02em', lineHeight: '1.2' }}>{entry.district}</h3>

                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{entry.total_demand.toLocaleString()}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>updates</span>
                                        </div>

                                        {entry.status !== 'Normal' && (
                                            <div style={{
                                                marginTop: 'auto',
                                                paddingTop: '0.8rem',
                                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: entry.status === 'Peak Demand' ? '#fca5a5' : '#86efac',
                                                fontSize: '0.85rem',
                                                fontWeight: '500'
                                            }}>
                                                {isMobileCampNeeded ? <Tent size={16} /> : (entry.status === 'Peak Demand' ? <Truck size={16} /> : <ArrowRight size={16} />)}
                                                {recommendationText}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
