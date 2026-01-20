'use client';

import { useState, useEffect, useMemo } from 'react';
import { AadhaarRecord, fetchMonthData, MONTHS } from '@/lib/data-service';
import { AlertTriangle, Shield, MapPin, TrendingUp, ChevronDown, Map as MapIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-geo';

// Border States & Districts Configuration
const BORDER_STATES = [
    'Jammu & Kashmir', 'Jammu and Kashmir',
    'Ladakh',
    'Punjab',
    'Rajasthan',
    'Gujarat',
    'Himachal Pradesh',
    'Uttarakhand',
    'Uttar Pradesh',
    'Bihar',
    'West Bengal',
    'Sikkim',
    'Assam',
    'Arunachal Pradesh',
    'Nagaland',
    'Manipur',
    'Mizoram',
    'Tripura',
    'Meghalaya'
];

interface SecurityAlert {
    pincode: string;
    state: string;
    district: string;
    locations: string[];
    adultEnrolment: number;
    childEnrolment: number;
    riskRatio: number;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    month: string;
}

export default function SecurityAlerts() {
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
    const [data, setData] = useState<AadhaarRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHeatMapOpen, setIsHeatMapOpen] = useState(false);
    const [geoData, setGeoData] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        fetchMonthData(selectedMonth).then((records) => {
            setData(records);
            setLoading(false);
        });
    }, [selectedMonth]);

    // Load India GeoJSON for heat map
    useEffect(() => {
        fetch('/india_states.json')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Error loading map:", err));
    }, []);

    // Calculate Security Alerts
    const securityAlerts = useMemo(() => {
        const alerts: SecurityAlert[] = [];

        // Filter only border state records
        const borderRecords = data.filter(record =>
            BORDER_STATES.some(state =>
                record.state.toLowerCase().includes(state.toLowerCase())
            )
        );

        borderRecords.forEach(record => {
            const adultEnrolment = record.data.enrolment.age_18_above;
            const childEnrolment = record.data.enrolment.age_0_5;

            // Avoid division by zero
            if (childEnrolment === 0) return;

            const riskRatio = adultEnrolment / childEnrolment;

            // Determine risk level (Stricter thresholds)
            let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
            if (riskRatio > 3.0) riskLevel = 'HIGH';      // Very unusual - strong anomaly
            else if (riskRatio > 2.0) riskLevel = 'MEDIUM'; // Moderate concern

            // Only include MEDIUM and HIGH risks
            if (riskLevel !== 'LOW') {
                alerts.push({
                    pincode: record.pincode,
                    state: record.state,
                    district: record.district,
                    locations: record.locations,
                    adultEnrolment,
                    childEnrolment,
                    riskRatio,
                    riskLevel,
                    month: selectedMonth
                });
            }
        });

        // Sort by risk ratio (highest first)
        return alerts.sort((a, b) => b.riskRatio - a.riskRatio);
    }, [data, selectedMonth]);

    const highRiskCount = securityAlerts.filter(a => a.riskLevel === 'HIGH').length;
    const mediumRiskCount = securityAlerts.filter(a => a.riskLevel === 'MEDIUM').length;

    // State-wise Risk Aggregation for Heat Map
    const stateRiskMap = useMemo(() => {
        const riskMap = new Map<string, 'HIGH' | 'MEDIUM' | 'LOW'>();

        // Initialize all border states as LOW
        BORDER_STATES.forEach(state => riskMap.set(state.toLowerCase(), 'LOW'));

        // Update with actual risks
        securityAlerts.forEach(alert => {
            const stateName = alert.state.toLowerCase();
            const currentRisk = riskMap.get(stateName) || 'LOW';

            // Upgrade risk level if higher risk found
            if (alert.riskLevel === 'HIGH') {
                riskMap.set(stateName, 'HIGH');
            } else if (alert.riskLevel === 'MEDIUM' && currentRisk === 'LOW') {
                riskMap.set(stateName, 'MEDIUM');
            }
        });

        return riskMap;
    }, [securityAlerts]);

    // State-wise aggregated statistics for tooltip
    const stateStats = useMemo(() => {
        const stats = new Map<string, { adults: number; children: number; ratio: number }>();

        securityAlerts.forEach(alert => {
            const stateName = alert.state.toLowerCase();
            const existing = stats.get(stateName) || { adults: 0, children: 0, ratio: 0 };

            stats.set(stateName, {
                adults: existing.adults + alert.adultEnrolment,
                children: existing.children + alert.childEnrolment,
                ratio: Math.max(existing.ratio, alert.riskRatio) // Highest ratio in state
            });
        });

        return stats;
    }, [securityAlerts]);

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-20">

            {/* Header */}
            <nav className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Border Security Alerts</h1>
                            <p className="text-xs text-slate-400">Adult Enrolment Anomaly Detection</p>
                        </div>
                    </div>

                    {/* Month Selector */}
                    <div className="flex gap-3 items-center">
                        {/* Border Areas Info Dropdown */}
                        <div className="relative group">
                            <button className="px-4 py-2 bg-slate-800 border border-white/10 hover:border-indigo-500/50 rounded-lg text-sm text-slate-300 flex items-center gap-2 transition-all">
                                <MapPin size={14} />
                                Border Areas ({BORDER_STATES.length})
                            </button>

                            {/* Dropdown on Hover */}
                            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 max-h-96 overflow-y-auto">
                                <div className="p-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Monitored Border States</h4>
                                    <div className="space-y-1">
                                        {BORDER_STATES.filter((s, i, arr) => arr.indexOf(s) === i).map((state, idx) => (
                                            <div key={idx} className="text-sm text-slate-300 py-1 px-2 hover:bg-white/5 rounded">
                                                {state}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsHeatMapOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg"
                        >
                            <MapIcon size={16} />
                            Heat Map
                        </button>

                        <div className="relative">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="appearance-none bg-[#131B2C] border border-white/10 hover:border-red-500/50 text-slate-200 pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
                            >
                                {MONTHS.map((m: string) => (
                                    <option key={m} value={m}>
                                        {new Date(m).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-8">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <h3 className="text-sm font-medium text-red-300">High Risk Areas</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{highRiskCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Ratio &gt; 3.0 (Critical)</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-sm font-medium text-yellow-300">Medium Risk Areas</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{mediumRiskCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Ratio 2.0 - 3.0</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-6 h-6 text-indigo-400" />
                            <h3 className="text-sm font-medium text-indigo-300">Total Monitored</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{securityAlerts.length}</p>
                        <p className="text-xs text-slate-400 mt-1">Border Pincodes</p>
                    </div>
                </div>

                {/* Alert Explanation */}
                <div className="bg-[#131B2C] border border-white/5 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-400" />
                        How This Works
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                        This system monitors <strong className="text-white">Adult Enrolment (18+)</strong> vs <strong className="text-white">Child Enrolment (0-5)</strong> ratio in border areas.
                        Normally, child enrolments should be higher than adult enrolments because most adults already have Aadhaar.
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        <strong className="text-red-400">High Risk (Ratio &gt; 3.0):</strong> Critical anomaly - Adult enrolments are 3x higher than child enrolments. Strong indicator of unusual activity.<br />
                        <strong className="text-yellow-400">Medium Risk (Ratio 2.0-3.0):</strong> Moderate anomaly - Requires investigation and monitoring.
                    </p>
                </div>

                {/* Alerts Table */}
                <div className="bg-[#131B2C] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold">Security Alerts ({securityAlerts.length})</h2>
                        <p className="text-sm text-slate-400 mt-1">Sorted by Risk Ratio (Highest First)</p>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-slate-500">Loading data...</div>
                    ) : securityAlerts.length === 0 ? (
                        <div className="p-20 text-center">
                            <Shield className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
                            <p className="text-slate-400">No security alerts for this month</p>
                            <p className="text-sm text-slate-500 mt-2">All border areas show normal enrolment patterns</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/50">
                                    <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                                        <th className="p-4">Risk</th>
                                        <th className="p-4">Pincode</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">State</th>
                                        <th className="p-4">Adult Enrol</th>
                                        <th className="p-4">Child Enrol</th>
                                        <th className="p-4">Ratio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {securityAlerts.map((alert, idx) => (
                                        <motion.tr
                                            key={alert.pincode}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${alert.riskLevel === 'HIGH'
                                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                                    }`}>
                                                    {alert.riskLevel === 'HIGH' && <AlertTriangle size={12} />}
                                                    {alert.riskLevel}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-white font-bold">{alert.pincode}</td>
                                            <td className="p-4">
                                                <div className="text-sm text-white">{alert.district}</div>
                                                <div className="text-xs text-slate-400 truncate max-w-[200px]">
                                                    {alert.locations.slice(0, 2).join(', ')}
                                                    {alert.locations.length > 2 && ` +${alert.locations.length - 2}`}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">{alert.state}</td>
                                            <td className="p-4 text-sm text-red-300 font-semibold">{alert.adultEnrolment}</td>
                                            <td className="p-4 text-sm text-green-300 font-semibold">{alert.childEnrolment}</td>
                                            <td className="p-4">
                                                <span className="text-lg font-bold text-white">{alert.riskRatio.toFixed(2)}</span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>

            {/* HEAT MAP MODAL */}
            <AnimatePresence>
                {isHeatMapOpen && geoData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                    >
                        <div className="w-full h-full max-w-6xl max-h-[85vh] bg-[#0B0F19] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col">

                            {/* Modal Header */}
                            <div className="p-4 md:p-6 border-b border-white/10 bg-[#131B2C]">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">Security Risk Heat Map</h2>
                                        <p className="text-slate-400 text-sm">Border States Risk Visualization</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Month Selector in Modal */}
                                        <div className="relative">
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="appearance-none bg-slate-800 border border-white/10 hover:border-indigo-500/50 text-slate-200 pl-3 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                                            >
                                                {MONTHS.map((m: string) => (
                                                    <option key={m} value={m}>
                                                        {new Date(m).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        </div>

                                        <button onClick={() => setIsHeatMapOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="p-4 border-b border-white/10 bg-slate-900/50 flex gap-6 justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span className="text-sm text-slate-300">High Risk (&gt; 3.0)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                    <span className="text-sm text-slate-300">Medium Risk (2.0-3.0)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span className="text-sm text-slate-300">Low Risk / Normal</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-slate-700 rounded"></div>
                                    <span className="text-sm text-slate-300">Non-Border State</span>
                                </div>
                            </div>

                            {/* Map Content */}
                            <div className="flex-1 relative bg-[#05080f] overflow-hidden">
                                <HeatMapSVG geoData={geoData} stateRiskMap={stateRiskMap} stateStats={stateStats} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Heat Map SVG Component
function HeatMapSVG({ geoData, stateRiskMap, stateStats }: {
    geoData: any,
    stateRiskMap: Map<string, 'HIGH' | 'MEDIUM' | 'LOW'>,
    stateStats: Map<string, { adults: number; children: number; ratio: number }>
}) {
    const [hoveredState, setHoveredState] = useState<{
        name: string;
        risk: 'HIGH' | 'MEDIUM' | 'LOW' | null;
        adults: number;
        children: number;
        ratio: number;
        x: number;
        y: number;
    } | null>(null);

    const { pathGenerator } = useMemo(() => {
        const proj = d3.geoMercator()
            .center([78.9629, 23.5937])
            .scale(1000)
            .translate([400, 300]);
        const path = d3.geoPath().projection(proj);
        return { pathGenerator: path };
    }, []);

    const getStateColor = (stateName: string) => {
        const normalizedName = stateName.toLowerCase();
        const risk = stateRiskMap.get(normalizedName);

        if (risk === 'HIGH') return '#ef4444'; // Red
        if (risk === 'MEDIUM') return '#eab308'; // Yellow
        if (risk === 'LOW') return '#22c55e'; // Green
        return '#334155'; // Slate (non-border state)
    };

    const handleMouseMove = (e: React.MouseEvent, stateName: string) => {
        const normalizedName = stateName.toLowerCase();
        const risk = stateRiskMap.get(normalizedName);
        const stats = stateStats.get(normalizedName);

        setHoveredState({
            name: stateName,
            risk: risk || null,
            adults: stats?.adults || 0,
            children: stats?.children || 0,
            ratio: stats?.ratio || 0,
            x: e.clientX,
            y: e.clientY
        });
    };

    return (
        <div className="relative w-full h-full">
            <svg viewBox="0 0 800 600" className="w-full h-full">
                <g>
                    {geoData.features.map((feature: any, i: number) => {
                        const stateName = feature.properties?.ST_NM || feature.properties?.NAME_1 || "Unknown";
                        const fillColor = getStateColor(stateName);

                        return (
                            <path
                                key={i}
                                d={pathGenerator(feature) || ""}
                                fill={fillColor}
                                stroke="#1e293b"
                                strokeWidth="1"
                                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                                onMouseMove={(e) => handleMouseMove(e, stateName)}
                                onMouseLeave={() => setHoveredState(null)}
                            />
                        );
                    })}
                </g>
            </svg>

            {/* Tooltip */}
            {hoveredState && (
                <div
                    className="fixed pointer-events-none z-[70] bg-slate-900/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-2xl"
                    style={{
                        left: hoveredState.x + 15,
                        top: hoveredState.y + 15
                    }}
                >
                    <h4 className="font-bold text-white text-lg mb-2">{hoveredState.name}</h4>
                    {hoveredState.risk ? (
                        <>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${hoveredState.risk === 'HIGH'
                                    ? 'bg-red-500/20 text-red-300'
                                    : hoveredState.risk === 'MEDIUM'
                                        ? 'bg-yellow-500/20 text-yellow-300'
                                        : 'bg-green-500/20 text-green-300'
                                    }`}>
                                    {hoveredState.risk} RISK
                                </span>
                            </div>
                            <div className="text-sm text-slate-300 space-y-1.5">
                                <div className="flex justify-between gap-6">
                                    <span className="text-slate-400">Adult Enrolments:</span>
                                    <span className="font-bold text-red-300">{hoveredState.adults.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <span className="text-slate-400">Child Enrolments:</span>
                                    <span className="font-bold text-green-300">{hoveredState.children.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-6 pt-1 border-t border-white/10">
                                    <span className="text-slate-400">Risk Ratio:</span>
                                    <span className="font-bold text-white">{hoveredState.ratio.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-400">Non-Border State</p>
                    )}
                </div>
            )}
        </div>
    );
}
