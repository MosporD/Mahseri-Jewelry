"""
01_generate_sample_data.py
Generates realistic Nokia and Huawei LTE PM counter CSV files and supporting dimension tables.

Site layout:
  NOK001–NOK005  : Always Nokia
  HWI001–HWI003  : Always Huawei
  SWP001          : Swapped Huawei → Nokia on 2024-01-16
  SWP002          : Swapped Huawei → Nokia on 2024-01-21

Output (written to ../data/):
  nokia_pm_sample.csv
  huawei_pm_sample.csv
  site_cell_inventory.csv
  vendor_swap_history.csv
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

# ---------------------------------------------------------------------------
# Site inventory
# ---------------------------------------------------------------------------
SITES = [
    {"site_id": "NOK001", "site_name": "Al Rabiah",   "lat": 31.975, "lon": 35.833, "always_vendor": "Nokia"},
    {"site_id": "NOK002", "site_name": "Zarqa Main",  "lat": 32.073, "lon": 36.088, "always_vendor": "Nokia"},
    {"site_id": "NOK003", "site_name": "Irbid City",  "lat": 32.557, "lon": 35.847, "always_vendor": "Nokia"},
    {"site_id": "NOK004", "site_name": "Aqaba Port",  "lat": 29.527, "lon": 35.007, "always_vendor": "Nokia"},
    {"site_id": "NOK005", "site_name": "Sweileh",     "lat": 32.005, "lon": 35.870, "always_vendor": "Nokia"},
    {"site_id": "HWI001", "site_name": "Marka",       "lat": 31.989, "lon": 35.979, "always_vendor": "Huawei"},
    {"site_id": "HWI002", "site_name": "Madaba",      "lat": 31.717, "lon": 35.793, "always_vendor": "Huawei"},
    {"site_id": "HWI003", "site_name": "Sahab",       "lat": 31.859, "lon": 36.000, "always_vendor": "Huawei"},
    {"site_id": "SWP001", "site_name": "Jubeiha",     "lat": 32.020, "lon": 35.890, "always_vendor": None, "swap_date": "2024-01-16"},
    {"site_id": "SWP002", "site_name": "Karak North", "lat": 31.180, "lon": 35.706, "always_vendor": None, "swap_date": "2024-01-21"},
]

CELLS = [1, 2, 3]
START_DATE = datetime(2024, 1, 1)
END_DATE   = datetime(2024, 1, 30)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def hour_factor(h):
    if   7  <= h <= 9:  return 1.7
    elif 10 <= h <= 13: return 1.4
    elif 17 <= h <= 21: return 2.0
    elif 0  <= h <= 5:  return 0.25
    else:               return 1.0

def day_factor(dow):
    return 0.65 if dow >= 5 else 1.0  # Friday/Saturday lighter in JO context

def swap_factor(date, swap_date_str):
    """Adjustment applied to Nokia KPIs in the days after a vendor swap."""
    swap_dt = datetime.strptime(swap_date_str, "%Y-%m-%d")
    days = (date - swap_dt).days
    if days < 0:
        return None          # site wasn't Nokia yet
    elif days <= 2:
        return 0.970         # brief tuning dip
    elif days <= 5:
        return 0.988
    elif days <= 10:
        return 0.997
    else:
        return 1.015         # Nokia typically outperforms after settling

# ---------------------------------------------------------------------------
# Nokia PM counter generation
# Nokia uses PM_* naming convention from NetAct / OSS-RC exports
# ---------------------------------------------------------------------------

def generate_nokia_rows(sites):
    rows = []
    nokia_sites = [s for s in sites if s["always_vendor"] == "Nokia" or "swap_date" in s]

    date = START_DATE
    while date <= END_DATE:
        for s in nokia_sites:
            swap_date = s.get("swap_date")
            if swap_date:
                adj = swap_factor(date, swap_date)
                if adj is None:
                    continue       # not Nokia yet on this date
            else:
                adj = 1.0

            for cell in CELLS:
                cell_id = f"{s['site_id']}-C{cell}"
                hf = 1.0  # we generate hourly rows
                df = day_factor(date.weekday())

                for h in range(24):
                    hf = hour_factor(h)
                    base = hf * df

                    rrc_att  = max(1, int(np.random.normal(1200 * base, 60 * base)))
                    rrc_sr   = min(0.9998, max(0.975, np.random.normal(0.9976, 0.0018))) * adj
                    rrc_succ = min(rrc_att, int(rrc_att * rrc_sr))

                    erab_att  = max(1, int(rrc_att * np.random.uniform(0.82, 0.90)))
                    erab_sr   = min(0.9998, max(0.970, np.random.normal(0.9981, 0.0020))) * adj
                    erab_succ = min(erab_att, int(erab_att * erab_sr))

                    ho_att  = max(0, int(np.random.normal(400 * base, 30 * base)))
                    ho_sr   = min(0.9999, max(0.930, np.random.normal(0.9870, 0.0040))) * adj
                    ho_succ = min(ho_att, int(ho_att * ho_sr))

                    dl_prb = min(98.0, max(3.0, np.random.normal(44 * base, 5)))
                    ul_prb = min(85.0, max(2.0, np.random.normal(28 * base, 4)))

                    # Nokia PDCP SDU Volume: bytes
                    dl_bytes = int(dl_prb * 1_600_000 * np.random.uniform(0.88, 1.12))
                    ul_bytes = int(ul_prb * 600_000  * np.random.uniform(0.88, 1.12))

                    # Nokia IP Throughput: kbps (averaged over interval)
                    dl_thp_kbps = max(0, int(dl_bytes * 8 / 3600 / 1000 * np.random.uniform(0.90, 1.10)))
                    ul_thp_kbps = max(0, int(ul_bytes * 8 / 3600 / 1000 * np.random.uniform(0.90, 1.10)))

                    # Nokia cell unavailability: seconds per hour
                    unavail_s = int(np.random.choice([0]*18 + [1, 2, 5, 10, 30, 60, 120, 180]))

                    rrc_max = max(1, int(np.random.normal(95 * base, 8 * base)))

                    rows.append({
                        "period_start":             f"{date.strftime('%Y-%m-%d')} {h:02d}:00:00",
                        "site_id":                  s["site_id"],
                        "cell_id":                  cell_id,
                        "PM_RRC_CONN_SETUP_ATT":    rrc_att,
                        "PM_RRC_CONN_SETUP_SUCC":   rrc_succ,
                        "PM_ERAB_SETUP_INIT_ATT":   erab_att,
                        "PM_ERAB_SETUP_INIT_SUCC":  erab_succ,
                        "PM_HO_INTER_ENB_ATT":      ho_att,
                        "PM_HO_INTER_ENB_SUCC":     ho_succ,
                        "PM_DL_PRB_UTIL":           round(dl_prb, 2),
                        "PM_UL_PRB_UTIL":           round(ul_prb, 2),
                        "PM_PDCP_VOL_DL_BYTES":     dl_bytes,
                        "PM_PDCP_VOL_UL_BYTES":     ul_bytes,
                        "PM_DRB_IP_THR_DL_KBPS":   dl_thp_kbps,
                        "PM_DRB_IP_THR_UL_KBPS":   ul_thp_kbps,
                        "PM_CELL_UNAVAIL_TIME_S":   unavail_s,
                        "PM_RRC_CONN_MAX":          rrc_max,
                    })

        date += timedelta(days=1)
    return pd.DataFrame(rows)

# ---------------------------------------------------------------------------
# Huawei PM counter generation
# Huawei uses dot-separated names from U2000 / iManager exports
# ---------------------------------------------------------------------------

def generate_huawei_rows(sites):
    rows = []
    huawei_sites = [s for s in sites if s["always_vendor"] == "Huawei" or "swap_date" in s]

    date = START_DATE
    while date <= END_DATE:
        for s in huawei_sites:
            swap_date = s.get("swap_date")
            if swap_date:
                swap_dt = datetime.strptime(swap_date, "%Y-%m-%d")
                if date >= swap_dt:
                    continue  # site is Nokia now

            for cell in CELLS:
                cell_id = f"{s['site_id']}-C{cell}"

                for h in range(24):
                    hf   = hour_factor(h)
                    df   = day_factor(date.weekday())
                    base = hf * df

                    # Huawei typically has slightly lower RRC SR than Nokia in this network
                    rrc_att  = max(1, int(np.random.normal(1150 * base, 65 * base)))
                    rrc_sr   = min(0.9997, max(0.968, np.random.normal(0.9958, 0.0022)))
                    rrc_succ = min(rrc_att, int(rrc_att * rrc_sr))

                    erab_att  = max(1, int(rrc_att * np.random.uniform(0.81, 0.89)))
                    erab_sr   = min(0.9997, max(0.965, np.random.normal(0.9972, 0.0024)))
                    erab_succ = min(erab_att, int(erab_att * erab_sr))

                    ho_att  = max(0, int(np.random.normal(380 * base, 32 * base)))
                    ho_sr   = min(0.9998, max(0.920, np.random.normal(0.9845, 0.0045)))
                    ho_succ = min(ho_att, int(ho_att * ho_sr))

                    # Huawei: total & available PRBs (100 per cell for 20 MHz)
                    rru_prb_avail_dl = 100
                    rru_prb_avail_ul = 100
                    dl_prb_used = min(rru_prb_avail_dl - 1, max(1, int(np.random.normal(42 * base, 5))))
                    ul_prb_used = min(rru_prb_avail_ul - 1, max(1, int(np.random.normal(27 * base, 4))))

                    # Huawei PDCP SDU Volume: bits (note: bits, not bytes)
                    dl_vol_bits = int(dl_prb_used * 1_600_000 * 8 * np.random.uniform(0.88, 1.12))
                    ul_vol_bits = int(ul_prb_used * 600_000  * 8 * np.random.uniform(0.88, 1.12))

                    # Huawei IP Throughput: kbps
                    dl_thp_kbps = max(0, int(dl_vol_bits / 3600 / 1000 * np.random.uniform(0.90, 1.10)))
                    ul_thp_kbps = max(0, int(ul_vol_bits / 3600 / 1000 * np.random.uniform(0.90, 1.10)))

                    # Huawei cell unavailability: seconds
                    unavail_s = int(np.random.choice([0]*18 + [1, 2, 5, 10, 30, 60, 120, 180]))

                    rrc_conn_max = max(1, int(np.random.normal(88 * base, 9 * base)))

                    rows.append({
                        "period_start":                 f"{date.strftime('%Y-%m-%d')} {h:02d}:00:00",
                        "site_id":                      s["site_id"],
                        "cell_id":                      cell_id,
                        "RRC_ConnEstabAtt_MOData":      rrc_att,
                        "RRC_ConnEstabSucc_MOData":     rrc_succ,
                        "ERAB_EstabInitAttNbr_QCI1":    erab_att,
                        "ERAB_EstabInitSuccNbr_QCI1":   erab_succ,
                        "HO_InterENBOutAtt":            ho_att,
                        "HO_InterENBOutSucc":           ho_succ,
                        "RRU_PrbTotDl":                 dl_prb_used,
                        "RRU_PrbAvailDl":               rru_prb_avail_dl,
                        "RRU_PrbTotUl":                 ul_prb_used,
                        "RRU_PrbAvailUl":               rru_prb_avail_ul,
                        "PDCP_SDUVolumeDl_Bits":        dl_vol_bits,
                        "PDCP_SDUVolumeUl_Bits":        ul_vol_bits,
                        "DRB_IPThpDl_Kbps":             dl_thp_kbps,
                        "DRB_IPThpUl_Kbps":             ul_thp_kbps,
                        "Cell_UnavailableTime_S":       unavail_s,
                        "RRC_ConnMax":                  rrc_conn_max,
                    })

        date += timedelta(days=1)
    return pd.DataFrame(rows)

# ---------------------------------------------------------------------------
# Dimension tables
# ---------------------------------------------------------------------------

def generate_site_cell_inventory(sites):
    rows = []
    for s in sites:
        for cell in CELLS:
            row = {
                "site_id":   s["site_id"],
                "site_name": s["site_name"],
                "cell_id":   f"{s['site_id']}-C{cell}",
                "sector":    cell,
                "latitude":  s["lat"],
                "longitude": s["lon"],
            }
            # Current vendor (after all swaps, as of end of dataset)
            if s.get("always_vendor"):
                row["current_vendor"] = s["always_vendor"]
            else:
                row["current_vendor"] = "Nokia"   # swapped sites end up Nokia
            rows.append(row)
    return pd.DataFrame(rows)

def generate_swap_history(sites):
    rows = []
    for s in sites:
        if "swap_date" in s:
            rows.append({
                "site_id":     s["site_id"],
                "site_name":   s["site_name"],
                "from_vendor": "Huawei",
                "to_vendor":   "Nokia",
                "swap_date":   s["swap_date"],
            })
    return pd.DataFrame(rows)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Generating Nokia PM data ...")
    nokia_df = generate_nokia_rows(SITES)
    nokia_path = os.path.join(OUT_DIR, "nokia_pm_sample.csv")
    nokia_df.to_csv(nokia_path, index=False)
    print(f"  {len(nokia_df):,} rows → {nokia_path}")

    print("Generating Huawei PM data ...")
    huawei_df = generate_huawei_rows(SITES)
    huawei_path = os.path.join(OUT_DIR, "huawei_pm_sample.csv")
    huawei_df.to_csv(huawei_path, index=False)
    print(f"  {len(huawei_df):,} rows → {huawei_path}")

    print("Generating site/cell inventory ...")
    inv_df = generate_site_cell_inventory(SITES)
    inv_path = os.path.join(OUT_DIR, "site_cell_inventory.csv")
    inv_df.to_csv(inv_path, index=False)
    print(f"  {len(inv_df):,} rows → {inv_path}")

    print("Generating vendor swap history ...")
    swap_df = generate_swap_history(SITES)
    swap_path = os.path.join(OUT_DIR, "vendor_swap_history.csv")
    swap_df.to_csv(swap_path, index=False)
    print(f"  {len(swap_df):,} rows → {swap_path}")

    print("Done.")
