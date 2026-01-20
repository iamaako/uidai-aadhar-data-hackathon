
'use client';

import { ASISummary } from '@/lib/asi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ASICharts({ data }: { data: ASISummary }) {
    // Prepare data for Pie Chart (Stress Distribution)
    const pieData = [
        { name: 'Healthy', value: data.entries.filter(e => e.stress_level === 'Healthy').length, color: '#10b981' },
        { name: 'Moderate', value: data.entries.filter(e => e.stress_level === 'Moderate').length, color: '#f59e0b' },
        { name: 'High Stress', value: data.entries.filter(e => e.stress_level === 'High').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Prepare data for Bar Chart (Top 5 Stressed Pincodes)
    const barData = data.entries.slice(0, 5).map(d => ({
        name: `${d.pincode} (${d.district})`,
        ASI: Math.max(d.asi_adult, d.asi_child)
    }));

    // Reusing glass-panel and layout classes from globals.css
    return (
        <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '1.5rem' }}>

            {/* Distribution Chart */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 className="kpi-label" style={{ marginBottom: '1rem', width: '100%' }}>Stress Distribution</h3>
                <div style={{ width: '100%', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1e1e24', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {pieData.map(p => (
                        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }}></span>
                            {p.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Stress Chart */}
            <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
                <h3 className="kpi-label" style={{ marginBottom: '1rem' }}>Top 5 Critical Pincodes</h3>
                <div style={{ width: '100%', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ left: 60, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                            <XAxis type="number" stroke="#666" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#fff" width={120} fontSize={10} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ background: '#1e1e24', border: '1px solid #333', borderRadius: '8px' }}
                            />
                            <Bar dataKey="ASI" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
