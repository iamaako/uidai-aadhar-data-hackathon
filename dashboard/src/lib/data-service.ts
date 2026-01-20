
export interface EnrolmentData {
  age_0_5: number;
  age_5_17: number;
  age_18_above: number;
}

export interface UpdateData {
  age_5_17: number;
  age_17_above: number;
}

export interface AadhaarMetrics {
  enrolment: EnrolmentData;
  biometric_update: UpdateData;
  demographic_update: UpdateData;
}

export interface AadhaarRecord {
  pincode: string;
  month: string;
  state: string;
  district: string;
  locations: string[];
  data: AadhaarMetrics;
}

export const MONTHS = [
  "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-09", "2025-10",
  "2025-11", "2025-12"
];

export async function fetchMonthData(month: string): Promise<AadhaarRecord[]> {
  try {
    const res = await fetch(`/data/aadhaar_data_${month}.json`);
    if (!res.ok) throw new Error("Failed to load data");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
