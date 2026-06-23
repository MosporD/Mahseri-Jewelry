"""
02_normalize_pm_data.py
Reads raw Nokia and Huawei PM CSV files and normalises them into a single
unified KPI schema that Power BI can consume directly.

KPI mapping
-----------
Nokia counter               → Huawei counter               → Unified column
PM_RRC_CONN_SETUP_ATT      ← RRC_ConnEstabAtt_MOData      → rrc_att
PM_RRC_CONN_SETUP_SUCC     ← RRC_ConnEstabSucc_MOData     → rrc_succ
PM_ERAB_SETUP_INIT_ATT     ← ERAB_EstabInitAttNbr_QCI1    → erab_att
PM_ERAB_SETUP_INIT_SUCC    ← ERAB_EstabInitSuccNbr_QCI1   → erab_succ
PM_HO_INTER_ENB_ATT        ← HO_InterENBOutAtt             → ho_att
PM_HO_INTER_ENB_SUCC       ← HO_InterENBOutSucc            → ho_succ
PM_DL_PRB_UTIL             ← RRU_PrbTotDl/RRU_PrbAvailDl  → dl_prb_util_pct
PM_UL_PRB_UTIL             ← RRU_PrbTotUl/RRU_PrbAvailUl  → ul_prb_util_pct
PM_PDCP_VOL_DL_BYTES       ← PDCP_SDUVolumeDl_Bits/8      → dl_vol_gb
PM_PDCP_VOL_UL_BYTES       ← PDCP_SDUVolumeUl_Bits/8      → ul_vol_gb
PM_DRB_IP_THR_DL_KBPS      ← DRB_IPThpDl_Kbps            → dl_throughput_mbps
PM_DRB_IP_THR_UL_KBPS      ← DRB_IPThpUl_Kbps            → ul_throughput_mbps
PM_CELL_UNAVAIL_TIME_S     ← Cell_UnavailableTime_S        → cell_availability_pct
PM_RRC_CONN_MAX            ← RRC_ConnMax                   → active_users_max

Output (written to ../output/):
  unified_kpi.csv
"""

import pandas as pd
import numpy as np
import os

DATA_DIR   = os.path.join(os.path.dirname(__file__), "..", "data")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

MEASUREMENT_PERIOD_S = 3600  # 1-hour collection window

# ---------------------------------------------------------------------------
# Nokia normaliser
# ---------------------------------------------------------------------------

def normalise_nokia(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["period_start"])

    out = pd.DataFrame()
    out["period_start"]        = df["period_start"]
    out["date"]                = df["period_start"].dt.date.astype(str)
    out["hour"]                = df["period_start"].dt.hour
    out["site_id"]             = df["site_id"]
    out["cell_id"]             = df["cell_id"]
    out["vendor"]              = "Nokia"

    out["rrc_att"]             = df["PM_RRC_CONN_SETUP_ATT"]
    out["rrc_succ"]            = df["PM_RRC_CONN_SETUP_SUCC"]
    out["erab_att"]            = df["PM_ERAB_SETUP_INIT_ATT"]
    out["erab_succ"]           = df["PM_ERAB_SETUP_INIT_SUCC"]
    out["ho_att"]              = df["PM_HO_INTER_ENB_ATT"]
    out["ho_succ"]             = df["PM_HO_INTER_ENB_SUCC"]

    # Nokia DL PRB already a percentage
    out["dl_prb_util_pct"]     = df["PM_DL_PRB_UTIL"].clip(0, 100)
    out["ul_prb_util_pct"]     = df["PM_UL_PRB_UTIL"].clip(0, 100)

    # Nokia volumes in bytes → GB
    out["dl_vol_gb"]           = df["PM_PDCP_VOL_DL_BYTES"] / 1e9
    out["ul_vol_gb"]           = df["PM_PDCP_VOL_UL_BYTES"] / 1e9

    # Nokia throughput in kbps → Mbps
    out["dl_throughput_mbps"]  = df["PM_DRB_IP_THR_DL_KBPS"] / 1000
    out["ul_throughput_mbps"]  = df["PM_DRB_IP_THR_UL_KBPS"] / 1000

    # Cell availability: (period - unavail) / period × 100
    out["cell_availability_pct"] = (
        (MEASUREMENT_PERIOD_S - df["PM_CELL_UNAVAIL_TIME_S"].clip(0, MEASUREMENT_PERIOD_S))
        / MEASUREMENT_PERIOD_S * 100
    )

    out["active_users_max"]    = df["PM_RRC_CONN_MAX"]

    # Derived KPIs (convenience for direct chart use)
    out["rrc_sr_pct"]          = np.where(
        out["rrc_att"] > 0, out["rrc_succ"] / out["rrc_att"] * 100, np.nan
    )
    out["erab_sr_pct"]         = np.where(
        out["erab_att"] > 0, out["erab_succ"] / out["erab_att"] * 100, np.nan
    )
    out["ho_sr_pct"]           = np.where(
        out["ho_att"] > 0, out["ho_succ"] / out["ho_att"] * 100, np.nan
    )

    return out

# ---------------------------------------------------------------------------
# Huawei normaliser
# ---------------------------------------------------------------------------

def normalise_huawei(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["period_start"])

    out = pd.DataFrame()
    out["period_start"]        = df["period_start"]
    out["date"]                = df["period_start"].dt.date.astype(str)
    out["hour"]                = df["period_start"].dt.hour
    out["site_id"]             = df["site_id"]
    out["cell_id"]             = df["cell_id"]
    out["vendor"]              = "Huawei"

    out["rrc_att"]             = df["RRC_ConnEstabAtt_MOData"]
    out["rrc_succ"]            = df["RRC_ConnEstabSucc_MOData"]
    out["erab_att"]            = df["ERAB_EstabInitAttNbr_QCI1"]
    out["erab_succ"]           = df["ERAB_EstabInitSuccNbr_QCI1"]
    out["ho_att"]              = df["HO_InterENBOutAtt"]
    out["ho_succ"]             = df["HO_InterENBOutSucc"]

    # Huawei PRB: used / available × 100
    out["dl_prb_util_pct"]     = (
        df["RRU_PrbTotDl"] / df["RRU_PrbAvailDl"].replace(0, np.nan) * 100
    ).clip(0, 100)
    out["ul_prb_util_pct"]     = (
        df["RRU_PrbTotUl"] / df["RRU_PrbAvailUl"].replace(0, np.nan) * 100
    ).clip(0, 100)

    # Huawei volumes in bits → GB
    out["dl_vol_gb"]           = df["PDCP_SDUVolumeDl_Bits"] / 8 / 1e9
    out["ul_vol_gb"]           = df["PDCP_SDUVolumeUl_Bits"] / 8 / 1e9

    # Huawei throughput in kbps → Mbps
    out["dl_throughput_mbps"]  = df["DRB_IPThpDl_Kbps"] / 1000
    out["ul_throughput_mbps"]  = df["DRB_IPThpUl_Kbps"] / 1000

    out["cell_availability_pct"] = (
        (MEASUREMENT_PERIOD_S - df["Cell_UnavailableTime_S"].clip(0, MEASUREMENT_PERIOD_S))
        / MEASUREMENT_PERIOD_S * 100
    )

    out["active_users_max"]    = df["RRC_ConnMax"]

    out["rrc_sr_pct"]          = np.where(
        out["rrc_att"] > 0, out["rrc_succ"] / out["rrc_att"] * 100, np.nan
    )
    out["erab_sr_pct"]         = np.where(
        out["erab_att"] > 0, out["erab_succ"] / out["erab_att"] * 100, np.nan
    )
    out["ho_sr_pct"]           = np.where(
        out["ho_att"] > 0, out["ho_succ"] / out["ho_att"] * 100, np.nan
    )

    return out

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    nokia_path  = os.path.join(DATA_DIR, "nokia_pm_sample.csv")
    huawei_path = os.path.join(DATA_DIR, "huawei_pm_sample.csv")

    print("Normalising Nokia PM data ...")
    nokia_norm = normalise_nokia(nokia_path)
    print(f"  {len(nokia_norm):,} rows")

    print("Normalising Huawei PM data ...")
    huawei_norm = normalise_huawei(huawei_path)
    print(f"  {len(huawei_norm):,} rows")

    unified = pd.concat([nokia_norm, huawei_norm], ignore_index=True)
    unified.sort_values(["date", "hour", "site_id", "cell_id"], inplace=True)
    unified.reset_index(drop=True, inplace=True)

    out_path = os.path.join(OUTPUT_DIR, "unified_kpi.csv")
    unified.to_csv(out_path, index=False)
    print(f"\nUnified dataset: {len(unified):,} rows → {out_path}")
    print("\nColumn summary:")
    print(unified.dtypes.to_string())
    print("\nSample statistics:")
    print(unified[["rrc_sr_pct", "erab_sr_pct", "ho_sr_pct",
                    "dl_throughput_mbps", "ul_throughput_mbps",
                    "cell_availability_pct"]].describe().round(3).to_string())
