# Nokia ↔ Huawei PM Counter Mapping

All Nokia and Huawei raw counters are normalised to the unified schema
produced by `scripts/02_normalize_pm_data.py`.

## Collection granularity

| Parameter         | Value                |
|-------------------|----------------------|
| Period            | 1 hour               |
| Level             | Cell (sector)        |
| Interface         | Nokia NetAct / Huawei U2000 CSV export |

---

## Counter mapping table

| Unified column        | Nokia counter                  | Huawei counter                    | Notes |
|-----------------------|--------------------------------|-----------------------------------|-------|
| `rrc_att`             | `PM_RRC_CONN_SETUP_ATT`        | `RRC_ConnEstabAtt_MOData`         | MO-Data cause only; add MO-Signalling for total |
| `rrc_succ`            | `PM_RRC_CONN_SETUP_SUCC`       | `RRC_ConnEstabSucc_MOData`        | |
| `erab_att`            | `PM_ERAB_SETUP_INIT_ATT`       | `ERAB_EstabInitAttNbr_QCI1`       | QCI-1 (voice); add QCI-9 for data |
| `erab_succ`           | `PM_ERAB_SETUP_INIT_SUCC`      | `ERAB_EstabInitSuccNbr_QCI1`      | |
| `ho_att`              | `PM_HO_INTER_ENB_ATT`          | `HO_InterENBOutAtt`               | Inter-eNB only |
| `ho_succ`             | `PM_HO_INTER_ENB_SUCC`         | `HO_InterENBOutSucc`              | |
| `dl_prb_util_pct`     | `PM_DL_PRB_UTIL` (already %)   | `RRU_PrbTotDl / RRU_PrbAvailDl`  | Nokia exports direct %; Huawei needs division |
| `ul_prb_util_pct`     | `PM_UL_PRB_UTIL` (already %)   | `RRU_PrbTotUl / RRU_PrbAvailUl`  | |
| `dl_vol_gb`           | `PM_PDCP_VOL_DL_BYTES / 1e9`   | `PDCP_SDUVolumeDl_Bits / 8 / 1e9`| Nokia in **bytes**, Huawei in **bits** |
| `ul_vol_gb`           | `PM_PDCP_VOL_UL_BYTES / 1e9`   | `PDCP_SDUVolumeUl_Bits / 8 / 1e9`| |
| `dl_throughput_mbps`  | `PM_DRB_IP_THR_DL_KBPS / 1000` | `DRB_IPThpDl_Kbps / 1000`        | Both in kbps |
| `ul_throughput_mbps`  | `PM_DRB_IP_THR_UL_KBPS / 1000` | `DRB_IPThpUl_Kbps / 1000`        | |
| `cell_availability_pct` | `(3600 - PM_CELL_UNAVAIL_TIME_S) / 3600 × 100` | `(3600 - Cell_UnavailableTime_S) / 3600 × 100` | |
| `active_users_max`    | `PM_RRC_CONN_MAX`              | `RRC_ConnMax`                     | Peak simultaneous RRC connections |

---

## Derived KPI formulas

| KPI                     | Formula                                    | Target (LTE) |
|-------------------------|--------------------------------------------|--------------|
| RRC Setup SR (%)        | `rrc_succ / rrc_att × 100`                | ≥ 99 %       |
| ERAB Setup SR (%)       | `erab_succ / erab_att × 100`              | ≥ 99 %       |
| Handover SR (%)         | `ho_succ / ho_att × 100`                  | ≥ 98 %       |
| DL Throughput (Mbps)    | Average of `dl_throughput_mbps`            | Varies       |
| Cell Availability (%)   | `(3600 - unavail_s) / 3600 × 100`         | ≥ 99.9 %     |
| DL PRB Utilisation (%)  | Average of `dl_prb_util_pct`               | < 80 %       |

---

## Important vendor-specific notes

### Nokia
- `PM_DL_PRB_UTIL` is already a percentage (0–100).
- PDCP SDU volumes are in **bytes**.
- Throughput counters are in **kbps**.
- Cell unavailability is in **seconds** per measurement period.

### Huawei
- PRB utilisation must be computed: `RRU_PrbTotDl / RRU_PrbAvailDl × 100`.
  `RRU_PrbAvailDl` = 100 for a 20 MHz cell; adjust for 10/15 MHz configurations.
- PDCP SDU volumes are in **bits** (not bytes). Divide by 8 before comparing with Nokia.
- `DRB_IPThpDl_Kbps` may be 0 when no active DRB bearers — filter these before averaging.
- Huawei separates inter/intra eNB handovers; `HO_InterENBOutAtt` covers only inter-eNB.
  Add `HO.IntraENBReq` if you want total HO attempts.

---

## Swap site identification

Sites that changed vendor are flagged in `vendor_swap_history.csv`:

| Column       | Description                          |
|--------------|--------------------------------------|
| `site_id`    | Matches `site_id` in Unified_KPI     |
| `swap_date`  | Date the Nokia equipment went live   |
| `from_vendor`| Always "Huawei" in this dataset      |
| `to_vendor`  | Always "Nokia" in this dataset       |

Use the `Swap Impact` DAX measures to compare average KPIs in the
7 days before and after `swap_date` for each swapped site.
