# 🆔 UIDAI Aadhaar Analytics & Intelligence Hub

An advanced, high-performance analytics platform designed for the **UIDAI Data Hackathon 2026**. This system provides deep insights into Aadhaar enrolment and update patterns, featuring specialized modules for **National Security** and **Infrastructure Planning**.

---

## 🛠 1. Data Pipeline: From CSV to Structured JSON

The core of this project lies in how we transformed massive, raw Aadhaar datasets into an optimized, query-ready format for the dashboard.

### **The Transformation Process**
Raw UIDAI data is typically massive CSV files. We implemented a Python-based processing pipeline (`process_data_monthly.py`) that performs the following:

1.  **Monthly Aggregation**: Groups raw data by month and pincode.
2.  **State/District Mapping**: Maps pincodes to their respective States and Districts.
3.  **Nested Data Structure**: Converts flat CSV rows into a structured JSON schema:
    -   **Enrolment**: Categorized by age groups (0-5, 5-17, 18+).
    -   **Updates**: Separate objects for Biometric and Demographic updates, segmented by age.
4.  **Performance Optimization**: By pre-aggregating data into monthly JSON files, the dashboard can load state-specific analytics instantly without needing a heavy backend database.

---

## 🚀 2. Core Features & Scientific Logic

### **A. Global Analytics Dashboard**
The command center for high-level monitoring.
-   **What it does**: Visualizes total enrolments, biometric updates, and demographic changes.
-   **Interaction**: Features a high-performance **interactive D3.js Map of India** for regional filtering.
-   **Use Case**: Governments can identify regions with low Aadhaar saturation or high update activity.

---

### **B. Border Security & Adult Enrolment Alert**
A specialized security module to detect potential **illegal immigration patterns**.

-   **The Logic**: Under normal demographics, child enrolments (0-5 years) are usually higher or equal to adult enrolments because most adults already have Aadhaar. A sudden surge in **Adult Enrolments** in border states is a strong anomaly.
-   **The Formula**:
    ```javascript
    Risk Ratio = (Adult Enrolments [18+]) / (Child Enrolments [0-5])
    ```
-   **Thresholds**:
    -   🔴 **HIGH RISK (Ratio > 3.0)**: Adult enrolments are 3x higher than children. Indicates critical anomaly.
    -   🟡 **MEDIUM RISK (Ratio > 2.0)**: Moderate anomaly requiring investigation.
-   **Geospatial Focus**: Monitored specifically in states like Assam, Meghalaya, West Bengal, etc.

---

### **C. Scheme Rush Detector (Demographic Surge)**
An infrastructure planning tool to detect "Government Scheme Impacts."

-   **The Logic**: When a new government benefit is launched, people rush to update their **Address or Mobile Number** (Demographic Updates). Biometric updates (Fingerprints/Iris) usually remain steady. A spike in the ratio between these two signals a "Scheme Rush."
-   **The Formula**:
    ```javascript
    Surge Ratio = (Demographic Updates [17+]) / (Biometric Updates [17+])
    ```
-   **Impact Assessment**:
    -   🔥 **CRITICAL (> 10x)**: Massive infrastructure scaling needed immediately.
    -   🟠 **HIGH (7x - 10x)**: Deploy additional enrolment centers.
    -   🟡 **MEDIUM (5x - 7x)**: Monitor resources.

---

## 💻 3. Technology Stack

-   **Frontend**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS 4 (Next-gen CSS-first configuration)
-   **Visualizations**: 
    -   **Maps**: D3.js + TopoJSON for high-performance interactive geospatial rendering.
    -   **Charts**: Recharts for responsive SVG data visualization.
-   **Animations**: Framer Motion for premium, buttery-smooth transitions.
-   **Data Processing**: Python (Pandas) for ETL (Extract, Transform, Load).

---

## 📦 4. Setup & Installation

### **Local Development**
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/iamaako/uidai-aadhar-data-hackathon.git
    cd dashboard
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`

### **Data Update**
To update the dashboard with new records:
1.  Place your raw CSV in the main directory.
2.  Run the Python processor: `python process_data_monthly.py`
3.  The new JSONs will be generated in `public/data/` and the dashboard will update automatically.

---

## 🌐 5. Deployment (Netlify ready)
This project is optimized for **Netlify**.
-   **Base Directory**: `dashboard`
-   **Build Command**: `npm run build`
-   **Publish Directory**: `dashboard/.next`

---

**Developed for UIDAI Data Hackathon 2026** 🇮🇳
