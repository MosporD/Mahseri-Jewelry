# Nokia / Huawei PM Cross-Reference Dashboard

Power BI template and Python ETL pipeline for comparing Nokia and Huawei
LTE Performance Management (PM) data on the same charts — enabling
cross-referencing of site and cell KPIs before and after a vendor swap.

## Use cases

| Scenario | How the dashboard helps |
|---|---|
| Site swaps from Huawei → Nokia | "Swap Impact" page shows KPI delta per site, pre vs post swap |
| Ongoing mixed-vendor network | "Vendor Comparison" page ranks sites/cells by vendor side-by-side |
| Cell-level deep dive | "Site & Cell Analysis" page drills from site to individual sector |
| Network-wide trend | "Overview" page shows aggregated KPIs over time |

## Quick start

```bash
pip install -r requirements.txt
python scripts/01_generate_sample_data.py   # generates sample Nokia + Huawei CSV files
python scripts/02_normalize_pm_data.py      # creates output/unified_kpi.csv
python scripts/03_generate_pbit.py          # creates output/VendorSwap_Dashboard.pbit
```

Then open `output/VendorSwap_Dashboard.pbit` in Power BI Desktop.

## Project structure

```
telecom-pm-dashboard/
├── scripts/
│   ├── 01_generate_sample_data.py   Generate realistic Nokia/Huawei PM CSVs
│   ├── 02_normalize_pm_data.py      Normalise both vendors to unified schema
│   └── 03_generate_pbit.py          Build the Power BI template (.pbit)
├── data/                            Raw PM CSV files (Nokia + Huawei + dimensions)
├── output/                          unified_kpi.csv + VendorSwap_Dashboard.pbit
├── dax/
│   └── kpi_measures.dax             All 40 DAX measures as plain text for reference
├── docs/
│   ├── kpi_mapping.md               Nokia ↔ Huawei counter mapping table
│   └── setup_guide.md               Step-by-step setup + visual design guide
└── requirements.txt
```

## Sample data layout

| Site IDs       | Vendor     | Period           |
|----------------|------------|------------------|
| NOK001–NOK005  | Nokia      | Full 30 days     |
| HWI001–HWI003  | Huawei     | Full 30 days     |
| SWP001         | Huawei→Nokia | Swap on Jan 16 |
| SWP002         | Huawei→Nokia | Swap on Jan 21 |

Each site has 3 cells (sectors), hourly data → ~50 k rows total.

## KPIs covered

- RRC Connection Setup Success Rate (%)
- E-RAB Setup Success Rate (%)
- Handover Success Rate (%)
- DL / UL Throughput (Mbps)
- Cell Availability (%)
- DL / UL PRB Utilisation (%)
- DL / UL Data Volume (GB)
- Peak Active Users

See `docs/kpi_mapping.md` for the full Nokia ↔ Huawei counter mapping.

## Replacing sample data with production data

1. Export Nokia PM counters from NetAct / OSS-RC as CSV.
2. Export Huawei PM counters from U2000 / iManager as CSV.
3. Update the column names in `scripts/02_normalize_pm_data.py` to match
   your actual export headers (the mapping table in `docs/kpi_mapping.md`
   documents the expected names).
4. Re-run scripts 02 and 03; refresh the Power BI dataset.
