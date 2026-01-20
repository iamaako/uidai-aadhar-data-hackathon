'use client';

import { useState, useEffect, useMemo } from 'react';
import { AadhaarRecord, fetchMonthData, MONTHS } from '@/lib/data-service';
import { TrendingUp, Activity, MapPin, Users, ChevronDown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SchemeAlert {
    pincode: string;
    state: string;
    district: string;
    locations: string[];
    demoUpdates: number;
    bioUpdates: number;
    ratio: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    month: string;
}

export default function SchemeRush() {
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
    const [data, setData] = useState<AadhaarRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchMonthData(selectedMonth).then((records) => {
            setData(records);
            setLoading(false);
        });
    }, [selectedMonth]);

    // Calculate Scheme Rush Alerts
    const schemeAlerts = useMemo(() => {
        const alerts: SchemeAlert[] = [];

        data.forEach(record => {
            const demoUpdates = record.data.demographic_update.age_17_above;
            const bioUpdates = record.data.biometric_update.age_17_above;

            // Avoid division by zero
            if (bioUpdates === 0) return;

            const ratio = demoUpdates / bioUpdates;

            // Determine severity based on ratio
            let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | null = null;
            if (ratio > 10) severity = 'CRITICAL';      // 10x surge - Critical
            else if (ratio > 7) severity = 'HIGH';       // 7x surge - High
            else if (ratio > 5) severity = 'MEDIUM';     // 5x surge - Medium

            // Only include alerts with severity
            if (severity) {
                alerts.push({
                    pincode: record.pincode,
                    state: record.state,
                    district: record.district,
                    locations: record.locations,
                    demoUpdates,
                    bioUpdates,
                    ratio,
                    severity,
                    month: selectedMonth
                });
            }
        });

        // Sort by ratio (highest first)
        return alerts.sort((a, b) => b.ratio - a.ratio);
    }, [data, selectedMonth]);

    const criticalCount = schemeAlerts.filter(a => a.severity === 'CRITICAL').length;
    const highCount = schemeAlerts.filter(a => a.severity === 'HIGH').length;
    const mediumCount = schemeAlerts.filter(a => a.severity === 'MEDIUM').length;

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-20">

            {/* Header */}
            <nav className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <TrendingUp className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Scheme Rush Detector</h1>
                            <p className="text-xs text-slate-400">Demographic Update Surge Analysis</p>
                        </div>
                    </div>

                    {/* Month Selector */}
                    <div className="relative">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="appearance-none bg-[#131B2C] border border-white/10 hover:border-orange-500/50 text-slate-200 pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
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
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-8">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <h3 className="text-sm font-medium text-red-300">Critical Rush</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{criticalCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Ratio &gt; 10x</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-orange-400" />
                            <h3 className="text-sm font-medium text-orange-300">High Demand</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{highCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Ratio 7x - 10x</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-sm font-medium text-yellow-300">Medium Surge</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{mediumCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Ratio 5x - 7x</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-6 h-6 text-indigo-400" />
                            <h3 className="text-sm font-medium text-indigo-300">Total Alerts</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{schemeAlerts.length}</p>
                        <p className="text-xs text-slate-400 mt-1">Affected Areas</p>
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-[#131B2C] border border-white/5 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-400" />
                        What This Detects
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                        This system monitors <strong className="text-white">Demographic Updates (Address/Mobile)</strong> vs <strong className="text-white">Biometric Updates</strong> ratio for adults (17+).
                        A sudden surge in demographic updates indicates a <strong className="text-orange-400">Government Scheme Launch</strong> where people are rushing to update their details.
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        <strong className="text-red-400">Critical (&gt; 10x):</strong> Massive scheme impact - Immediate infrastructure scaling needed.<br />
                        <strong className="text-orange-400">High (7x-10x):</strong> Significant demand - Deploy additional enrollment centers.<br />
                        <strong className="text-yellow-400">Medium (5x-7x):</strong> Moderate surge - Monitor and prepare resources.
                    </p>
                </div>

                {/* Alerts Table */}
                <div className="bg-[#131B2C] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold">Scheme Rush Alerts ({schemeAlerts.length})</h2>
                        <p className="text-sm text-slate-400 mt-1">Sorted by Surge Ratio (Highest First)</p>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-slate-500">Loading data...</div>
                    ) : schemeAlerts.length === 0 ? (
                        <div className="p-20 text-center">
                            <Activity className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
                            <p className="text-slate-400">No scheme rush detected for this month</p>
                            <p className="text-sm text-slate-500 mt-2">All areas show normal update patterns</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/50">
                                    <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                                        <th className="p-4">Severity</th>
                                        <th className="p-4">Pincode</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">State</th>
                                        <th className="p-4">Demo Updates</th>
                                        <th className="p-4">Bio Updates</th>
                                        <th className="p-4">Ratio</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {schemeAlerts.map((alert, idx) => (
                                        <motion.tr
                                            key={alert.pincode}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${alert.severity === 'CRITICAL'
                                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                        : alert.severity === 'HIGH'
                                                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                                    }`}>
                                                    {alert.severity === 'CRITICAL' && <AlertCircle size={12} />}
                                                    {alert.severity}
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
                                            <td className="p-4 text-sm text-orange-300 font-semibold">{alert.demoUpdates.toLocaleString()}</td>
                                            <td className="p-4 text-sm text-blue-300 font-semibold">{alert.bioUpdates.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className="text-lg font-bold text-white">{alert.ratio.toFixed(1)}x</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded ${alert.severity === 'CRITICAL'
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : alert.severity === 'HIGH'
                                                            ? 'bg-orange-500/10 text-orange-400'
                                                            : 'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {alert.severity === 'CRITICAL' ? 'Scale Now' :
                                                        alert.severity === 'HIGH' ? 'Deploy Centers' :
                                                            'Monitor'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
