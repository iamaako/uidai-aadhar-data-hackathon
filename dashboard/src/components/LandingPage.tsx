'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, LayoutDashboard, ArrowRight, Fingerprint, Activity, Map } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500/30">

            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[128px] translate-y-1/2" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-center mb-24 max-w-5xl relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        UIDAI Data Hackathon 2026
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                        <span className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
                            Next-Gen Intelligence
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-gradient">
                            For Aadhaar Data
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400/90 leading-relaxed max-w-3xl mx-auto font-light">
                        Unlock predictive insights, detect anomalies, and optimize logistics with our <span className="text-white font-medium">AI-powered neural dashboard</span>.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="flex flex-wrap justify-center gap-6 w-full">

                    {/* Feature 1: Main Dashboard */}
                    <FeatureCard
                        href="/dashboard"
                        title="Analytics Dashboard"
                        description="Comprehensive view of enrolments and updates."
                        icon={<LayoutDashboard size={28} className="text-indigo-400" />}
                        gradient="from-indigo-500/20 to-blue-600/5"
                        border="border-indigo-500/20"
                        delay={0.1}
                    />

                    {/* Feature 2: Border Security */}
                    <FeatureCard
                        href="/security"
                        title="Border Security"
                        description="Detection of illegal immigration via risk ratios."
                        icon={<ShieldAlert size={28} className="text-red-400" />}
                        gradient="from-red-500/20 to-orange-600/5"
                        border="border-red-500/20"
                        delay={0.2}
                    />

                    {/* Feature 3: Scheme Rush */}
                    <FeatureCard
                        href="/scheme-rush"
                        title="Scheme Rush"
                        description="Identify government scheme impacts via surges."
                        icon={<TrendingUp size={28} className="text-emerald-400" />}
                        gradient="from-emerald-500/20 to-teal-600/5"
                        border="border-emerald-500/20"
                        delay={0.3}
                    />

                    {/* Feature 4: Migration Tracker */}
                    <FeatureCard
                        href="/migration"
                        title="Migration Tracker"
                        description="Track urban planning needs based on influx."
                        icon={<Activity size={28} className="text-blue-400" />} // Using Activity for now, imported above. Or I can import Waves if needed, but staying consistent.
                        gradient="from-blue-500/20 to-cyan-600/5"
                        border="border-blue-500/20"
                        delay={0.4}
                    />

                    {/* Feature 5: ASI Protocol */}
                    <FeatureCard
                        href="/asi"
                        title="Aadhaar Stress Index"
                        description="Real-time predictive analytics identifying operational bottlenecks."
                        icon={<Activity size={28} className="text-purple-400" />}
                        gradient="from-purple-500/20 to-violet-600/5"
                        border="border-purple-500/20"
                        delay={0.5}
                    />

                    {/* Feature 6: SADRA Module */}
                    <FeatureCard
                        href="/sadra"
                        title="SADRA Planner"
                        description="Seasonal Aadhaar Demand & Resource Allocator."
                        icon={<Activity size={28} className="text-yellow-400" />}
                        gradient="from-yellow-500/20 to-orange-600/5"
                        border="border-yellow-500/20"
                        delay={0.6}
                    />

                </div>

            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-20 flex gap-6 text-slate-500 text-sm"
            >
                <div className="flex items-center gap-2">
                    <Activity size={16} /> Real-time Processing
                </div>
                <div className="flex items-center gap-2">
                    <Map size={16} /> Geospatial Analysis
                </div>
            </motion.div>
        </div>
        </div >
    );
}

function FeatureCard({ href, title, description, icon, gradient, border, delay }: any) {
    return (
        <Link href={href} className="group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay, duration: 0.5 }}
                className={`h-full relative overflow-hidden bg-[#0F1623] border border-white/5 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] group-hover:border-indigo-500/30 group-hover:-translate-y-2`}
            >
                {/* Dynamic Gradient Background On Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-125 mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Icon Container */}
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-14 h-14 bg-[#1A2333] border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                            {React.cloneElement(icon, { size: 28, className: `${icon.props.className} group-hover:text-white transition-colors` })}
                        </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all">
                        {title}
                    </h3>

                    <p className="text-slate-400 text-base leading-relaxed mb-10 flex-1 group-hover:text-slate-300 transition-colors font-light">
                        {description}
                    </p>

                    <div className="flex items-center gap-3 text-sm font-bold text-indigo-400 group-hover:text-white transition-colors uppercase tracking-widest">
                        <span>Launch Module</span>
                        <div className="w-8 h-[1px] bg-indigo-500/50 group-hover:w-12 group-hover:bg-white transition-all duration-300"></div>
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
