# Setup Guide – Nokia / Huawei PM Cross-Reference Dashboard

## Prerequisites

- Python 3.9+ with `pandas` and `numpy`  (`pip install -r requirements.txt`)
- Power BI Desktop (free download from Microsoft)

---

## Step 1 — Generate sample data

```bash
cd telecom-pm-dashboard
python scripts/01_generate_sample_data.py
```

Creates four files in `data/`:
- `nokia_pm_sample.csv` — raw Nokia PM counters for 10 sites × 3 cells × 30 days (hourly)
- `huawei_pm_sample.csv` — raw Huawei PM counters (same period)
- `site_cell_inventory.csv` — site/cell dimension table
- `vendor_swap_history.csv` — two sites that swapped Huawei → Nokia mid-month

> **To use your own data:** replace the generated CSVs with exports from
> NetAct (Nokia) and U2000/iManager (Huawei). Column names must match
> the schema described in `docs/kpi_mapping.md`.

---

## Step 2 — Normalise PM data

```bash
python scripts/02_normalize_pm_data.py
```

Reads both raw CSVs, applies the counter mapping from `docs/kpi_mapping.md`,
and writes `output/unified_kpi.csv` — the single table that Power BI uses.

---

## Step 3 — Generate the Power BI template

```bash
python scripts/03_generate_pbit.py
```

Creates `output/VendorSwap_Dashboard.pbit`.

By default the Power Query M code is hard-coded to the `output/` folder
of this project. If you move the CSV files, pass `--csv-root`:

```bash
python scripts/03_generate_pbit.py --csv-root /absolute/path/to/your/csvs
```

---

## Step 4 — Open in Power BI Desktop

1. Double-click `output/VendorSwap_Dashboard.pbit`.
2. Power BI Desktop opens and asks you to save as a `.pbix` file.
3. Click **Home → Refresh** to load data.
4. All 40 DAX measures are already in the **Fields** pane, organised into:
   - **Core KPIs** — RRC SR, ERAB SR, HO SR, throughput, availability
   - **Vendor Split** — same KPIs filtered to Nokia or Huawei
   - **Deltas** — Nokia minus Huawei for each KPI
   - **Swap Impact** — pre/post swap averages and the difference
   - **Helpers** — # Sites, # Cells, # Nokia Sites, # Huawei Sites

---

## Step 5 — Build the report visuals

The template ships with 4 blank pages. Add visuals in Power BI Desktop:

### Page 1 – Overview
| Visual          | X-axis / Category         | Values                                   |
|-----------------|---------------------------|------------------------------------------|
| Card ×4         | —                         | RRC Setup SR, ERAB SR, HO SR, Cell Avail |
| Line chart      | `DateDim[date]`           | [RRC Setup SR (%)], [ERAB Setup SR (%)]  |
| Bar chart       | `Unified_KPI[vendor]`     | [Avg DL Throughput (Mbps)]               |
| Slicer          | `Unified_KPI[vendor]`     | —                                        |
| Slicer          | `DateDim[date]` (range)   | —                                        |

### Page 2 – Vendor Comparison
| Visual          | Category                  | Values                                        |
|-----------------|---------------------------|-----------------------------------------------|
| Clustered bar   | `Site_Cell[site_name]`    | [Nokia – RRC SR (%)], [Huawei – RRC SR (%)]  |
| Clustered bar   | `Site_Cell[site_name]`    | [Nokia – DL Thp (Mbps)], [Huawei – DL Thp]  |
| Column chart    | `Site_Cell[site_name]`    | [Delta – RRC SR (pp)]  (green/red colouring) |
| Table           | site_name, vendor         | All Core KPI measures                         |
| Slicer          | `Site_Cell[current_vendor]` | —                                           |

### Page 3 – Site & Cell Analysis
| Visual          | Category                  | Values                           |
|-----------------|---------------------------|----------------------------------|
| Matrix          | Rows: site_name / cell_id | RRC SR, ERAB SR, HO SR, DL Thp  |
| Line chart      | `DateDim[date]`           | [RRC Setup SR (%)] per cell_id   |
| Scatter         | X: DL PRB Util, Y: DL Thp | Size: # RRC attempts             |
| Slicer          | `Site_Cell[site_name]`    | —                                |
| Slicer          | `Unified_KPI[vendor]`     | —                                |

### Page 4 – Swap Impact
| Visual          | Category                  | Values                                           |
|-----------------|---------------------------|--------------------------------------------------|
| Clustered bar   | `Vendor_Swap[site_name]`  | [Pre-Swap RRC SR (%)], [Post-Swap RRC SR (%)]   |
| Clustered bar   | `Vendor_Swap[site_name]`  | [Pre-Swap DL Thp (Mbps)], [Post-Swap DL Thp]   |
| Column chart    | `Vendor_Swap[site_name]`  | [Swap Impact – RRC SR (pp)]                     |
| Reference line  | Set to Y=0 on the delta   | Highlights improvement vs degradation            |
| Line chart      | `DateDim[date]`           | [RRC Setup SR (%)] — draw a vertical line at swap_date |
| Slicer          | `Vendor_Swap[site_name]`  | —                                                |

---

## Connecting your production data

Replace the CSV source in Power Query:

1. Home → Transform Data → Data Source Settings
2. Update the file path for `unified_kpi.csv` (and the two dimension files)
3. Alternatively replace the M source with a SQL Server / Oracle / BigQuery query —
   the column names in the unified schema are database-agnostic.

### Minimum columns required in `unified_kpi.csv`

```
date, hour, site_id, cell_id, vendor,
rrc_att, rrc_succ, erab_att, erab_succ, ho_att, ho_succ,
dl_prb_util_pct, ul_prb_util_pct,
dl_vol_gb, ul_vol_gb,
dl_throughput_mbps, ul_throughput_mbps,
cell_availability_pct, active_users_max
```

All other columns (rrc_sr_pct etc.) are optional — the DAX measures
recompute them from the raw counters at query time.

---

## Scheduling / automation

Run scripts 01 → 02 on a schedule (cron / Windows Task Scheduler) to
keep the dashboard current:

```bash
# Example: daily at 06:00
python /path/to/scripts/01_generate_sample_data.py   # replace with your ETL
python /path/to/scripts/02_normalize_pm_data.py
```

Then trigger a Power BI dataset refresh via the Power BI REST API or
Power BI Service scheduled refresh.
