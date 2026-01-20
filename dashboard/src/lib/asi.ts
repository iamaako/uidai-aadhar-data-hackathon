
import fs from 'fs';
import path from 'path';

export interface ASIEntry {
    pincode: string;
    month: string;
    state: string;
    district: string;
    locations: string[];
    asi_adult: number;
    asi_child: number;
    stress_level_adult: 'Healthy' | 'Moderate' | 'High';
    stress_level_child: 'Healthy' | 'Moderate' | 'High';
    stress_level: 'Healthy' | 'Moderate' | 'High';
}

export interface ASISummary {
    totalPincodes: number;
    totalRecords: number;
    highStressPincodes: number;
    averageASIAdult: number;
    averageASIChild: number;
    entries: ASIEntry[];
}

const DATA_DIR = path.join(process.cwd(), 'src/data/processed_json_monthly');

export async function getASIData(): Promise<ASISummary> {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort();

    if (files.length === 0) {
        throw new Error("No data files found");
    }

    let allEntries: ASIEntry[] = [];

    // Iterate over ALL files to aggregate multi-month data
    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const jsonEntries = JSON.parse(rawData);

        const fileMonth = file.replace('aadhaar_data_', '').replace('.json', '');

        const processed = jsonEntries.map((entry: any) => {
            // Extract Counts
            const demo = entry.data.demographic_update || {};
            const bio = entry.data.biometric_update || {};

            const demo_adult = demo.age_17_above || 0;
            const bio_adult = bio.age_17_above || 0;

            const demo_child = demo.age_5_17 || 0;
            const bio_child = bio.age_17_above || 0; // Fix: Use age_5_17 from bio update if available

            // The user schema said: biometric_update: { age_5_17: ..., age_17_above: ... }
            const bio_child_val = bio.age_5_17 || 0;

            // Calculate ASI using Logarithmic Scale (Richter Scale style)
            const asi_adult_raw = (demo_adult + 1) / (bio_adult + 1);
            const asi_child_raw = (demo_child + 1) / (bio_child_val + 1);

            const asi_adult = Math.log2(asi_adult_raw + 1);
            const asi_child = Math.log2(asi_child_raw + 1);

            // Determine Stress Levels (Log Scale Thresholds)
            const getStress = (asi: number) => {
                if (asi >= 2.25) return 'High';
                if (asi >= 1.25) return 'Moderate';
                return 'Healthy';
            };

            const stress_level_adult = getStress(asi_adult);
            const stress_level_child = getStress(asi_child);

            const maxASI = Math.max(asi_adult, asi_child);
            const stress_level = getStress(maxASI);

            return {
                pincode: entry.pincode,
                month: entry.month || fileMonth,
                state: entry.state,
                district: entry.district,
                locations: entry.locations,
                asi_adult: parseFloat(asi_adult.toFixed(2)),
                asi_child: parseFloat(asi_child.toFixed(2)),
                stress_level_adult,
                stress_level_child,
                stress_level
            };
        });

        allEntries = [...allEntries, ...processed];
    }

    // Sort by highest overall stress first
    allEntries.sort((a, b) => Math.max(b.asi_adult, b.asi_child) - Math.max(a.asi_adult, a.asi_child));

    // Calculate Summaries
    const highStressCount = allEntries.filter(d => d.stress_level === 'High').length;
    const avgAdult = allEntries.length > 0 ? allEntries.reduce((acc, curr) => acc + curr.asi_adult, 0) / allEntries.length : 0;
    const avgChild = allEntries.length > 0 ? allEntries.reduce((acc, curr) => acc + curr.asi_child, 0) / allEntries.length : 0;

    return {
        // Total Unique Pincodes (approx)
        totalPincodes: new Set(allEntries.map(e => e.pincode)).size,
        // Total Records (for correct percentage calc)
        totalRecords: allEntries.length,
        highStressPincodes: highStressCount,
        averageASIAdult: parseFloat(avgAdult.toFixed(2)),
        averageASIChild: parseFloat(avgChild.toFixed(2)),
        entries: allEntries
    };
}
