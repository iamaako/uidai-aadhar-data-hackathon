'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3-geo';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface IndiaMapProps {
    onStateSelect: (stateName: string) => void;
}

// MEMOIZED COMPONENT: This is the key to performance. 
// It renders ONE state. It only re-renders if the path generator or feature data changes.
// It DOES NOT re-render when the parent's transform changes (because that's a prop on the separate <g>).
const MapFeature = React.memo(({ feature, pathGenerator, onSelect, onHover }: any) => {
    const stateName = feature.properties?.name || feature.properties?.ST_NM || feature.properties?.NAME_1 || feature.properties?.state || "Unknown";
    const pathData = pathGenerator(feature);

    return (
        <path
            d={pathData || ""}
            stroke="#475569"
            strokeWidth="0.5"
            // Use CSS for hover color change (FAST) instead of React State
            className="fill-slate-800 hover:fill-indigo-600 transition-colors duration-150 ease-in-out cursor-pointer outline-none"
            onMouseEnter={() => onHover(stateName)}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(stateName);
            }}
            // Optimization for SVG rendering speed
            shapeRendering="geometricPrecision"
        />
    );
});
MapFeature.displayName = 'MapFeature';

export default function IndiaMap({ onStateSelect }: IndiaMapProps) {
    const [geoData, setGeoData] = useState<any>(null);
    const [hoveredState, setHoveredState] = useState<string | null>(null);

    // Zoom & Pan State
    const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetch('/india_states.json')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Error loading map:", err));
    }, []);

    // Configure Projection
    const { pathGenerator } = useMemo(() => {
        if (!geoData) return { projection: null, pathGenerator: null };

        const proj = d3.geoMercator()
            .center([78.9629, 23.5937])
            .scale(700) // Reduced scale for better visibility
            .translate([400, 300]);

        const path = d3.geoPath().projection(proj);
        return { projection: proj, pathGenerator: path };
    }, [geoData]);


    // Zoom Handlers
    const handleZoom = (factor: number) => {
        setTransform(prev => ({
            ...prev,
            k: Math.max(0.5, Math.min(8, prev.k * factor))
        }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPoint({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent text selection
        const newX = e.clientX - startPoint.x;
        const newY = e.clientY - startPoint.y;
        setTransform(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleMouseUp = () => setIsDragging(false);

    // Stable callbacks for children
    const handleHover = useCallback((name: string | null) => {
        setHoveredState(name);
    }, []);

    const handleSelect = useCallback((name: string) => {
        console.log("Selected:", name);
        onStateSelect(name);
    }, [onStateSelect]);


    if (!geoData || !pathGenerator) return <div className="text-center text-slate-400 py-20 animate-pulse">Loading Map Engine...</div>;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B0F19] rounded-3xl relative overflow-hidden border border-white/5 select-none">

            {/* Map Container - This handles the pan/drag */}
            <div
                className="w-full h-full cursor-move relative overflow-auto touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

                {/* SVG Layer */}
                <svg
                    viewBox="0 0 800 600"
                    className="w-full h-full min-w-full min-h-full"
                    style={{
                        width: `${100 * transform.k}%`,
                        height: `${100 * transform.k}%`
                    }}
                >
                    <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`} className="pointer-events-auto">
                        {geoData.features.map((feature: any, i: number) => (
                            <MapFeature
                                key={i}
                                feature={feature}
                                pathGenerator={pathGenerator}
                                onSelect={handleSelect}
                                onHover={handleHover}
                            />
                        ))}
                    </g>
                </svg>
            </div>

            {/* Hover Label Overlay */}
            {hoveredState && (
                <div className="absolute top-4 left-4 bg-slate-900/90 border border-indigo-500/50 px-4 py-2 rounded-xl text-white font-bold shadow-xl pointer-events-none z-20 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    {hoveredState}
                </div>
            )}

            {/* Controls - Moved higher up */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
                <button onClick={() => handleZoom(1.2)} className="bg-slate-800/80 backdrop-blur p-2 rounded-lg text-white hover:bg-indigo-600 transition shadow-lg border border-white/10 active:scale-95" title="Zoom In">
                    <ZoomIn size={20} />
                </button>
                <button onClick={() => handleZoom(0.8)} className="bg-slate-800/80 backdrop-blur p-2 rounded-lg text-white hover:bg-indigo-600 transition shadow-lg border border-white/10 active:scale-95" title="Zoom Out">
                    <ZoomOut size={20} />
                </button>
                <button onClick={() => setTransform({ k: 1, x: 0, y: 0 })} className="bg-slate-800/80 backdrop-blur p-2 rounded-lg text-white hover:bg-indigo-600 transition shadow-lg border border-white/10 active:scale-95" title="Reset">
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
}
