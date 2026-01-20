
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Map component with no SSR to prevent Leaflet window errors
const MapWithNoSSR = dynamic(() => import('./IndiaMap'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-[#131B2C] rounded-3xl animate-pulse flex items-center justify-center text-slate-500">Loading Map Engine...</div>
});

export default MapWithNoSSR;
