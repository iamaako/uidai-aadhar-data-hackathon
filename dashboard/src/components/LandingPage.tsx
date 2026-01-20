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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20 max-w-3xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium uppercase tracking-wider mb-6">
                        <Fingerprint size={14} /> Data Hackathon 2026
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        UIDAI Analytics & <br />Intelligence Hub
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Next-generation dashboard for Aadhaar data analysis. Detect anomalies, monitor border security, and identify demographic trends with AI-powered insights.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">

                    {/* Feature 1: Main Dashboard */}
                    <FeatureCard
                        href="/dashboard"
                        title="Analytics Dashboard"
                        description="Comprehensive view of enrolments, biometric updates, and demographic trends across India."
                        icon={<LayoutDashboard size={32} className="text-indigo-400" />}
                        gradient="from-indigo-500/20 to-blue-600/5"
                        border="border-indigo-500/20"
                        delay={0.1}
                    />

                    {/* Feature 2: Border Security */}
                    <FeatureCard
                        href="/security"
                        title="Border Security"
                        description="AI-driven detection of illegal immigration anomalies in border states using enrolment ratios."
                        icon={<ShieldAlert size={32} className="text-red-400" />}
                        gradient="from-red-500/20 to-orange-600/5"
                        border="border-red-500/20"
                        delay={0.2}
                    />

                    {/* Feature 3: Scheme Rush */}
                    <FeatureCard
                        href="/scheme-rush"
                        title="Scheme Rush Detector"
                        description="Identify government scheme impacts by analyzing surges in demographic update requests."
                        icon={<TrendingUp size={32} className="text-emerald-400" />}
                        gradient="from-emerald-500/20 to-teal-600/5"
                        border="border-emerald-500/20"
                        delay={0.3}
                    />

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
        </div>
    );
}

function FeatureCard({ href, title, description, icon, gradient, border, delay }: any) {
    return (
        <Link href={href} className="group">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay, duration: 0.5 }}
                className={`h-full relative overflow-hidden bg-[#131B2C] border ${border} hover:border-white/20 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hoverShadow hover:-translate-y-1`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6 p-4 bg-[#0B0F19]/50 rounded-2xl w-fit border border-white/5 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                        {title}
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1 group-hover:text-slate-300 transition-colors">
                        {description}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                        Explore Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
