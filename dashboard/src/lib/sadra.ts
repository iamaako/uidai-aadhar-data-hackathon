
import fs from 'fs';
import path from 'path';

export interface SADRAEntry {
    district: string;
    state: string;
    month: string;
    child_demand: number;
    adult_demand: number;
    total_demand: number;
    seasonal_index: number;
    status: 'Peak Demand' | 'Normal' | 'Low Demand';
    recommendation: string;
}

export interface SADRASummary {
    totalDistricts: number;
    peakMonth: string;
    peakDistrict: string;
    monthlyData: Record<string, SADRAEntry[]>; // grouped by month
}

const DATA_DIR = path.join(process.cwd(), 'src/data/processed_json_monthly');

export async function getSADRAData(): Promise<SADRASummary> {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort();

    if (files.length === 0) {
        throw new Error("No data files found");
    }

    // Intermediate storage: District -> Month -> Counts
    const districtMonthlyMap: Record<string, Record<string, { child: number, adult: number, state: string }>> = {};
    const allMonths = new Set<string>();

    // 1. Aggregation Phase
    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const jsonEntries = JSON.parse(rawData);

        const fileMonth = file.replace('aadhaar_data_', '').replace('.json', '');
        allMonths.add(fileMonth);

        for (const entry of jsonEntries) {
            const district = entry.district;
            const state = entry.state;
            const month = entry.month || fileMonth; // Use entry month if available

            if (!districtMonthlyMap[district]) {
                districtMonthlyMap[district] = {};
            }
            if (!districtMonthlyMap[district][month]) {
                districtMonthlyMap[district][month] = { child: 0, adult: 0, state };
            }

            const demo = entry.data.demographic_update || {};
            districtMonthlyMap[district][month].child += (demo.age_5_17 || 0);
            districtMonthlyMap[district][month].adult += (demo.age_17_above || 0);
        }
    }

    // 2. Calculation Phase (Seasonal Index & Recommendations)
    const monthlyDataResults: Record<string, SADRAEntry[]> = {};
    const monthsArr = Array.from(allMonths).sort();

    let overallPeakVal = 0;
    let overallPeakMonth = '';
    let overallPeakDistrict = '';

    Object.entries(districtMonthlyMap).forEach(([district, monthsMap]) => {
        // Calculate Average Monthly Demand for this district
        let totalAnnualDemand = 0;
        let monthCount = 0;

        Object.values(monthsMap).forEach(v => {
            totalAnnualDemand += (v.child + v.adult);
            monthCount++;
        });

        const avgMonthlyDemand = monthCount > 0 ? totalAnnualDemand / monthCount : 0;

        // Generate Entry for each month
        Object.entries(monthsMap).forEach(([month, counts]) => {
            const totalRegionDemand = counts.child + counts.adult;
            // Avoid division by zero
            const seasonalIndex = avgMonthlyDemand > 0 ? totalRegionDemand / avgMonthlyDemand : 0;

            let status: SADRAEntry['status'] = 'Normal';
            let recommendation = 'Maintain current resources';

            // Refined Logic (Jan 2026 Update):
            // We use a wider "Normal Band" (0.7 to 1.4) to avoid flagging minor fluctuations.
            // "Peak" is now reserved for significant surges (> 40% above average).
            // "Low" is reserved for significant drops (< 70% of average).

            if (seasonalIndex >= 1.4 && totalRegionDemand > 300) {
                status = 'Peak Demand';
                const extraKits = Math.ceil((totalRegionDemand - avgMonthlyDemand) / 400); // Tighter heuristic: 1 kit ~ 400 surplus updates
                recommendation = `Increase capacity: +${Math.max(1, extraKits)} Biometric Kits required`;
            } else if (seasonalIndex <= 0.7) {
                status = 'Low Demand';
                recommendation = 'Resource Surplus: Relocate unused staff/kits to high-demand zones';
            }

            if (totalRegionDemand > overallPeakVal) {
                overallPeakVal = totalRegionDemand;
                overallPeakDistrict = district;
                overallPeakMonth = month;
            }

            const entry: SADRAEntry = {
                district,
                state: counts.state,
                month,
                child_demand: counts.child,
                adult_demand: counts.adult,
                total_demand: totalRegionDemand,
                seasonal_index: parseFloat(seasonalIndex.toFixed(2)),
                status,
                recommendation
            };

            if (!monthlyDataResults[month]) {
                monthlyDataResults[month] = [];
            }
            monthlyDataResults[month].push(entry);
        });
    });

    // Sort entries within each month by Seasonal Index (Highest first)
    for (const m of monthsArr) {
        if (monthlyDataResults[m]) {
            monthlyDataResults[m].sort((a, b) => b.seasonal_index - a.seasonal_index);
        }
    }

    return {
        totalDistricts: Object.keys(districtMonthlyMap).length,
        peakMonth: overallPeakMonth,
        peakDistrict: overallPeakDistrict,
        monthlyData: monthlyDataResults
    };
}
