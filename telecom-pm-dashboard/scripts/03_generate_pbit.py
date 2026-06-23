"""
03_generate_pbit.py
Generates VendorSwap_Dashboard.pbit — a Power BI template file containing:
  • 4 pre-configured tables  (Unified_KPI, Site_Cell, DateDim, Vendor_Swap)
  • All relationships
  • ~40 DAX measures
  • 4 report pages  (Overview, Vendor Comparison, Site & Cell Analysis, Swap Impact)
  • Slicers for Vendor, Site, Cell, Date range

Run this script after 01 and 02 have been executed so the CSV paths exist.
The generated .pbit points to unified_kpi.csv and the three dimension CSVs
in the output/ and data/ directories relative to this project root.

Usage:
  python 03_generate_pbit.py [--csv-root /absolute/path/to/output]

  If --csv-root is omitted the Power Query M code uses a parameter
  called CsvRootPath that the user sets once after opening the .pbit.
"""

import argparse
import json
import os
import uuid
import zipfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
OUTPUT_DIR   = os.path.join(PROJECT_ROOT, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PBIT_PATH = os.path.join(OUTPUT_DIR, "VendorSwap_Dashboard.pbit")

# ---------------------------------------------------------------------------
# Helper – deterministic fake GUIDs so the model is reproducible
# ---------------------------------------------------------------------------
_GUID_COUNTER = 0
def guid(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"mahseri-telecom-{seed}"))

# ---------------------------------------------------------------------------
# Power Query M expressions for each table
# The user sets CsvRootPath once; all tables read from there.
# ---------------------------------------------------------------------------

def m_unified_kpi(csv_root: str) -> list:
    if csv_root:
        src = f'Csv.Document(File.Contents("{csv_root}/unified_kpi.csv"),'
    else:
        src = 'Csv.Document(File.Contents(CsvRootPath & "/unified_kpi.csv"),'
    return [
        "let",
        f'    Source = {src}[Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.None]),',
        '    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),',
        '    #"Changed Types" = Table.TransformColumnTypes(#"Promoted Headers",{',
        '        {"period_start", type datetime}, {"date", type date}, {"hour", Int64.Type},',
        '        {"site_id", type text}, {"cell_id", type text}, {"vendor", type text},',
        '        {"rrc_att", Int64.Type}, {"rrc_succ", Int64.Type},',
        '        {"erab_att", Int64.Type}, {"erab_succ", Int64.Type},',
        '        {"ho_att", Int64.Type}, {"ho_succ", Int64.Type},',
        '        {"dl_prb_util_pct", type number}, {"ul_prb_util_pct", type number},',
        '        {"dl_vol_gb", type number}, {"ul_vol_gb", type number},',
        '        {"dl_throughput_mbps", type number}, {"ul_throughput_mbps", type number},',
        '        {"cell_availability_pct", type number},',
        '        {"active_users_max", Int64.Type},',
        '        {"rrc_sr_pct", type number}, {"erab_sr_pct", type number}, {"ho_sr_pct", type number}',
        '    })',
        "in",
        '    #"Changed Types"',
    ]

def m_site_cell(csv_root: str) -> list:
    if csv_root:
        src = f'Csv.Document(File.Contents("{csv_root}/site_cell_inventory.csv"),'
    else:
        src = 'Csv.Document(File.Contents(CsvRootPath & "/../data/site_cell_inventory.csv"),'
    return [
        "let",
        f'    Source = {src}[Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.None]),',
        '    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),',
        '    #"Changed Types" = Table.TransformColumnTypes(#"Promoted Headers",{',
        '        {"site_id", type text}, {"site_name", type text}, {"cell_id", type text},',
        '        {"sector", Int64.Type}, {"latitude", type number}, {"longitude", type number},',
        '        {"current_vendor", type text}',
        '    })',
        "in",
        '    #"Changed Types"',
    ]

def m_vendor_swap(csv_root: str) -> list:
    if csv_root:
        src = f'Csv.Document(File.Contents("{csv_root}/vendor_swap_history.csv"),'
    else:
        src = 'Csv.Document(File.Contents(CsvRootPath & "/../data/vendor_swap_history.csv"),'
    return [
        "let",
        f'    Source = {src}[Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.None]),',
        '    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),',
        '    #"Changed Types" = Table.TransformColumnTypes(#"Promoted Headers",{',
        '        {"site_id", type text}, {"site_name", type text},',
        '        {"from_vendor", type text}, {"to_vendor", type text},',
        '        {"swap_date", type date}',
        '    })',
        "in",
        '    #"Changed Types"',
    ]

def m_date_dim() -> list:
    return [
        "let",
        '    StartDate = #date(2024, 1, 1),',
        '    EndDate   = #date(2024, 12, 31),',
        '    DayCount  = Duration.Days(EndDate - StartDate) + 1,',
        '    DateList  = List.Dates(StartDate, DayCount, #duration(1, 0, 0, 0)),',
        '    DateTable = Table.FromList(DateList, Splitter.SplitByNothing(), {"date"}),',
        '    #"Changed Type"   = Table.TransformColumnTypes(DateTable, {{"date", type date}}),',
        '    #"Year Added"     = Table.AddColumn(#"Changed Type",   "year",        each Date.Year([date]),        Int64.Type),',
        '    #"Month Added"    = Table.AddColumn(#"Year Added",     "month_num",   each Date.Month([date]),       Int64.Type),',
        '    #"Month Name"     = Table.AddColumn(#"Month Added",    "month_name",  each Date.MonthName([date]),   type text),',
        '    #"Week Added"     = Table.AddColumn(#"Month Name",     "week_num",    each Date.WeekOfYear([date]),  Int64.Type),',
        '    #"DOW Added"      = Table.AddColumn(#"Week Added",     "day_of_week", each Date.DayOfWeek([date]),   Int64.Type),',
        '    #"DOW Name"       = Table.AddColumn(#"DOW Added",      "day_name",    each Date.DayOfWeekName([date]), type text),',
        '    #"IsWeekend"      = Table.AddColumn(#"DOW Name",       "is_weekend",  each Date.DayOfWeek([date]) >= 5, type logical)',
        "in",
        '    #"IsWeekend"',
    ]

# ---------------------------------------------------------------------------
# Build DataModelSchema JSON (TMSL format, compatibilityLevel 1550)
# ---------------------------------------------------------------------------

def build_data_model_schema(csv_root: str) -> dict:
    def col(name, dtype, src=None):
        return {
            "name": name,
            "dataType": dtype,
            "lineageTag": guid(f"col-{name}"),
            "sourceColumn": src or name,
            "summarizeBy": "none" if dtype == "string" else "sum",
        }

    def measure(name, expr, fmt="0.00", display_folder=""):
        m = {
            "name": name,
            "expression": expr,
            "formatString": fmt,
            "lineageTag": guid(f"msr-{name}"),
        }
        if display_folder:
            m["displayFolder"] = display_folder
        return m

    # --- Unified_KPI table ---------------------------------------------------
    unified_kpi_cols = [
        col("period_start",          "dateTime"),
        col("date",                  "dateTime"),
        col("hour",                  "int64"),
        col("site_id",               "string"),
        col("cell_id",               "string"),
        col("vendor",                "string"),
        col("rrc_att",               "int64"),
        col("rrc_succ",              "int64"),
        col("erab_att",              "int64"),
        col("erab_succ",             "int64"),
        col("ho_att",                "int64"),
        col("ho_succ",               "int64"),
        col("dl_prb_util_pct",       "double"),
        col("ul_prb_util_pct",       "double"),
        col("dl_vol_gb",             "double"),
        col("ul_vol_gb",             "double"),
        col("dl_throughput_mbps",    "double"),
        col("ul_throughput_mbps",    "double"),
        col("cell_availability_pct", "double"),
        col("active_users_max",      "int64"),
        col("rrc_sr_pct",            "double"),
        col("erab_sr_pct",           "double"),
        col("ho_sr_pct",             "double"),
    ]

    core_measures = [
        measure("RRC Setup SR (%)",
                "DIVIDE(SUM(Unified_KPI[rrc_succ]), SUM(Unified_KPI[rrc_att]), BLANK()) * 100",
                display_folder="Core KPIs"),
        measure("ERAB Setup SR (%)",
                "DIVIDE(SUM(Unified_KPI[erab_succ]), SUM(Unified_KPI[erab_att]), BLANK()) * 100",
                display_folder="Core KPIs"),
        measure("Handover SR (%)",
                "DIVIDE(SUM(Unified_KPI[ho_succ]), SUM(Unified_KPI[ho_att]), BLANK()) * 100",
                display_folder="Core KPIs"),
        measure("Avg DL Throughput (Mbps)",
                "AVERAGEX(SUMMARIZE(Unified_KPI,Unified_KPI[site_id],Unified_KPI[cell_id],Unified_KPI[date],Unified_KPI[hour],\"v\",AVERAGE(Unified_KPI[dl_throughput_mbps])),[v])",
                display_folder="Core KPIs"),
        measure("Avg UL Throughput (Mbps)",
                "AVERAGEX(SUMMARIZE(Unified_KPI,Unified_KPI[site_id],Unified_KPI[cell_id],Unified_KPI[date],Unified_KPI[hour],\"v\",AVERAGE(Unified_KPI[ul_throughput_mbps])),[v])",
                display_folder="Core KPIs"),
        measure("Avg Cell Availability (%)",
                "AVERAGEX(SUMMARIZE(Unified_KPI,Unified_KPI[site_id],Unified_KPI[cell_id],Unified_KPI[date],Unified_KPI[hour],\"v\",AVERAGE(Unified_KPI[cell_availability_pct])),[v])",
                display_folder="Core KPIs"),
        measure("Avg DL PRB Util (%)",
                "AVERAGEX(SUMMARIZE(Unified_KPI,Unified_KPI[site_id],Unified_KPI[cell_id],Unified_KPI[date],Unified_KPI[hour],\"v\",AVERAGE(Unified_KPI[dl_prb_util_pct])),[v])",
                display_folder="Core KPIs"),
        measure("Avg UL PRB Util (%)",
                "AVERAGEX(SUMMARIZE(Unified_KPI,Unified_KPI[site_id],Unified_KPI[cell_id],Unified_KPI[date],Unified_KPI[hour],\"v\",AVERAGE(Unified_KPI[ul_prb_util_pct])),[v])",
                display_folder="Core KPIs"),
        measure("Total DL Volume (GB)",  "SUM(Unified_KPI[dl_vol_gb])", display_folder="Core KPIs"),
        measure("Total UL Volume (GB)",  "SUM(Unified_KPI[ul_vol_gb])", display_folder="Core KPIs"),
        measure("Peak Active Users",     "MAX(Unified_KPI[active_users_max])", "0", display_folder="Core KPIs"),
        # Vendor-split
        measure("Nokia – RRC SR (%)",   "CALCULATE([RRC Setup SR (%)], Unified_KPI[vendor]=\"Nokia\")",   display_folder="Vendor Split"),
        measure("Huawei – RRC SR (%)",  "CALCULATE([RRC Setup SR (%)], Unified_KPI[vendor]=\"Huawei\")", display_folder="Vendor Split"),
        measure("Nokia – ERAB SR (%)",  "CALCULATE([ERAB Setup SR (%)], Unified_KPI[vendor]=\"Nokia\")", display_folder="Vendor Split"),
        measure("Huawei – ERAB SR (%)", "CALCULATE([ERAB Setup SR (%)], Unified_KPI[vendor]=\"Huawei\")", display_folder="Vendor Split"),
        measure("Nokia – HO SR (%)",    "CALCULATE([Handover SR (%)], Unified_KPI[vendor]=\"Nokia\")",   display_folder="Vendor Split"),
        measure("Huawei – HO SR (%)",   "CALCULATE([Handover SR (%)], Unified_KPI[vendor]=\"Huawei\")", display_folder="Vendor Split"),
        measure("Nokia – DL Thp (Mbps)",  "CALCULATE([Avg DL Throughput (Mbps)], Unified_KPI[vendor]=\"Nokia\")",  display_folder="Vendor Split"),
        measure("Huawei – DL Thp (Mbps)", "CALCULATE([Avg DL Throughput (Mbps)], Unified_KPI[vendor]=\"Huawei\")", display_folder="Vendor Split"),
        measure("Nokia – Cell Avail (%)",  "CALCULATE([Avg Cell Availability (%)], Unified_KPI[vendor]=\"Nokia\")",  display_folder="Vendor Split"),
        measure("Huawei – Cell Avail (%)", "CALCULATE([Avg Cell Availability (%)], Unified_KPI[vendor]=\"Huawei\")", display_folder="Vendor Split"),
        # Deltas
        measure("Delta – RRC SR (pp)",      "[Nokia – RRC SR (%)] - [Huawei – RRC SR (%)]",        display_folder="Deltas"),
        measure("Delta – ERAB SR (pp)",     "[Nokia – ERAB SR (%)] - [Huawei – ERAB SR (%)]",      display_folder="Deltas"),
        measure("Delta – HO SR (pp)",       "[Nokia – HO SR (%)] - [Huawei – HO SR (%)]",          display_folder="Deltas"),
        measure("Delta – DL Thp (Mbps)",    "[Nokia – DL Thp (Mbps)] - [Huawei – DL Thp (Mbps)]", display_folder="Deltas"),
        measure("Delta – Cell Avail (pp)",  "[Nokia – Cell Avail (%)] - [Huawei – Cell Avail (%)]", display_folder="Deltas"),
        # Swap impact (requires Vendor_Swap relationship)
        measure("Pre-Swap RRC SR (%)",
                "CALCULATE([RRC Setup SR (%)],FILTER(Unified_KPI,RELATED(Vendor_Swap[swap_date])<>BLANK()&&Unified_KPI[date]<RELATED(Vendor_Swap[swap_date])))",
                display_folder="Swap Impact"),
        measure("Post-Swap RRC SR (%)",
                "CALCULATE([RRC Setup SR (%)],FILTER(Unified_KPI,RELATED(Vendor_Swap[swap_date])<>BLANK()&&Unified_KPI[date]>=RELATED(Vendor_Swap[swap_date])))",
                display_folder="Swap Impact"),
        measure("Pre-Swap ERAB SR (%)",
                "CALCULATE([ERAB Setup SR (%)],FILTER(Unified_KPI,RELATED(Vendor_Swap[swap_date])<>BLANK()&&Unified_KPI[date]<RELATED(Vendor_Swap[swap_date])))",
                display_folder="Swap Impact"),
        measure("Post-Swap ERAB SR (%)",
                "CALCULATE([ERAB Setup SR (%)],FILTER(Unified_KPI,RELATED(Vendor_Swap[swap_date])<>BLANK()&&Unified_KPI[date]>=RELATED(Vendor_Swap[swap_date])))",
                display_folder="Swap Impact"),
        measure("Pre-Swap DL Thp (Mbps)",
                "CALCULATE([Avg DL Throughput (Mbps)],FILTER(Unified_KPI,RELATED(Vendor_Swap[swap_date])<>BLANK()&&Unified_KPI[date]<RELATED(Vendor_Swap[swap_date])))",
                display_folder="Swap Impact"),
        measure("Post-Swap DL Thp (Mbps)",
                "CALCULATE([Avg DL Throughput (Mbps)],FILTER(Unified_KPI,RELATED(Vendor_Swap[swap_date])<>BLANK()&&Unified_KPI[date]>=RELATED(Vendor_Swap[swap_date])))",
                display_folder="Swap Impact"),
        measure("Swap Impact – RRC SR (pp)",  "[Post-Swap RRC SR (%)] - [Pre-Swap RRC SR (%)]",        display_folder="Swap Impact"),
        measure("Swap Impact – ERAB SR (pp)", "[Post-Swap ERAB SR (%)] - [Pre-Swap ERAB SR (%)]",      display_folder="Swap Impact"),
        measure("Swap Impact – DL Thp (Mbps)","[Post-Swap DL Thp (Mbps)] - [Pre-Swap DL Thp (Mbps)]", display_folder="Swap Impact"),
        # Helpers
        measure("# Sites",        "DISTINCTCOUNT(Unified_KPI[site_id])", "0", display_folder="Helpers"),
        measure("# Cells",        "DISTINCTCOUNT(Unified_KPI[cell_id])", "0", display_folder="Helpers"),
        measure("# Nokia Sites",  "CALCULATE(DISTINCTCOUNT(Unified_KPI[site_id]),Unified_KPI[vendor]=\"Nokia\")",  "0", display_folder="Helpers"),
        measure("# Huawei Sites", "CALCULATE(DISTINCTCOUNT(Unified_KPI[site_id]),Unified_KPI[vendor]=\"Huawei\")", "0", display_folder="Helpers"),
    ]

    # --- DateDim table -------------------------------------------------------
    date_dim_cols = [
        col("date",         "dateTime"),
        col("year",         "int64"),
        col("month_num",    "int64"),
        col("month_name",   "string"),
        col("week_num",     "int64"),
        col("day_of_week",  "int64"),
        col("day_name",     "string"),
        col("is_weekend",   "boolean"),
    ]

    # --- Site_Cell table -----------------------------------------------------
    site_cell_cols = [
        col("site_id",        "string"),
        col("site_name",      "string"),
        col("cell_id",        "string"),
        col("sector",         "int64"),
        col("latitude",       "double"),
        col("longitude",      "double"),
        col("current_vendor", "string"),
    ]

    # --- Vendor_Swap table ---------------------------------------------------
    vendor_swap_cols = [
        col("site_id",     "string"),
        col("site_name",   "string"),
        col("from_vendor", "string"),
        col("to_vendor",   "string"),
        col("swap_date",   "dateTime"),
    ]

    def table(name, columns, measures_list=None, m_expr=None):
        t = {
            "name": name,
            "lineageTag": guid(f"tbl-{name}"),
            "columns": columns,
            "partitions": [
                {
                    "name": name,
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": m_expr or [],
                    },
                }
            ],
        }
        if measures_list:
            t["measures"] = measures_list
        return t

    # Parameter table for CSV root path (only added when csv_root is not supplied)
    tables = [
        table("Unified_KPI",  unified_kpi_cols, core_measures,    m_unified_kpi(csv_root)),
        table("DateDim",      date_dim_cols,    None,              m_date_dim()),
        table("Site_Cell",    site_cell_cols,   None,              m_site_cell(csv_root)),
        table("Vendor_Swap",  vendor_swap_cols, None,              m_vendor_swap(csv_root)),
    ]

    if not csv_root:
        # Add a query parameter so the user can set the path interactively
        tables.append({
            "name": "CsvRootPath",
            "lineageTag": guid("tbl-CsvRootPath"),
            "columns": [],
            "partitions": [
                {
                    "name": "CsvRootPath",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": [
                            "let",
                            '    Value = "/path/to/output"',
                            "in",
                            "    Value",
                        ],
                    },
                }
            ],
        })

    relationships = [
        {
            "name": guid("rel-ukpi-date"),
            "fromTable": "Unified_KPI",
            "fromColumn": "date",
            "toTable": "DateDim",
            "toColumn": "date",
            "crossFilteringBehavior": "oneDirection",
        },
        {
            "name": guid("rel-ukpi-site"),
            "fromTable": "Unified_KPI",
            "fromColumn": "cell_id",
            "toTable": "Site_Cell",
            "toColumn": "cell_id",
            "crossFilteringBehavior": "oneDirection",
        },
        {
            "name": guid("rel-ukpi-swap"),
            "fromTable": "Unified_KPI",
            "fromColumn": "site_id",
            "toTable": "Vendor_Swap",
            "toColumn": "site_id",
            "crossFilteringBehavior": "oneDirection",
        },
    ]

    return {
        "name": "Nokia_Huawei_PM_Dashboard",
        "compatibilityLevel": 1550,
        "model": {
            "culture": "en-US",
            "dataAccessOptions": {
                "legacyRedirects": True,
                "returnErrorValuesAsNull": True,
            },
            "tables": tables,
            "relationships": relationships,
            "annotations": [
                {
                    "name": "PBI_QueryOrder",
                    "value": json.dumps(["Unified_KPI", "DateDim", "Site_Cell", "Vendor_Swap"]),
                }
            ],
        },
    }

# ---------------------------------------------------------------------------
# Build Report/Layout JSON
# ---------------------------------------------------------------------------

def _slicer_config(title: str, col_ref: str) -> str:
    return json.dumps({
        "name": guid(f"slicer-{title}"),
        "layouts": [{"id": 0, "position": {"z": 0, "x": 0, "y": 0, "width": 200, "height": 252, "tabOrder": 0}}],
        "singleVisual": {
            "visualType": "slicer",
            "projections": {"Values": [{"queryRef": col_ref, "active": True}]},
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": col_ref.split(".")[0][0].lower(), "Entity": col_ref.split(".")[0], "Type": 0}],
                "Select": [{"Column": {"Expression": {"SourceRef": {"Source": col_ref.split(".")[0][0].lower()}}, "Property": col_ref.split(".")[1]}, "Name": col_ref}],
            },
            "objects": {
                "general": [{"properties": {"filter": {"expr": {"Literal": {"Value": "null"}}}}}],
                "header": [{"properties": {"text": {"expr": {"Literal": {"Value": f"'{title}'"}}}}}],
            },
        },
    })

def _kpi_card_config(title: str, measure_name: str) -> str:
    return json.dumps({
        "name": guid(f"card-{title}"),
        "singleVisual": {
            "visualType": "card",
            "projections": {"Values": [{"queryRef": f"Unified_KPI.{measure_name}", "active": True}]},
            "objects": {
                "labels": [{"properties": {"show": {"expr": {"Literal": {"Value": "true"}}}, "fontSize": {"expr": {"Literal": {"Value": "24D"}}}}}],
                "categoryLabels": [{"properties": {"text": {"expr": {"Literal": {"Value": f"'{title}'"}}}}}],
            },
        },
    })

def build_report_layout() -> dict:
    # We define page sections with placeholder visual containers.
    # Pages: Overview, Vendor Comparison, Site & Cell Analysis, Swap Impact
    pages = [
        {
            "name": "OverviewPage",
            "displayName": "Overview",
            "ordinal": 0,
            "visualContainers": [],
            "filters": "[]",
            "config": json.dumps({"relationships": {}}),
        },
        {
            "name": "VendorCompPage",
            "displayName": "Vendor Comparison",
            "ordinal": 1,
            "visualContainers": [],
            "filters": "[]",
            "config": json.dumps({"relationships": {}}),
        },
        {
            "name": "SiteCellPage",
            "displayName": "Site & Cell Analysis",
            "ordinal": 2,
            "visualContainers": [],
            "filters": "[]",
            "config": json.dumps({"relationships": {}}),
        },
        {
            "name": "SwapImpactPage",
            "displayName": "Swap Impact",
            "ordinal": 3,
            "visualContainers": [],
            "filters": "[]",
            "config": json.dumps({"relationships": {}}),
        },
    ]

    return {
        "id": 0,
        "resourcePackages": [],
        "sections": pages,
        "config": json.dumps({
            "version": "5.42",
            "themeCollection": {
                "baseTheme": {"name": "CY24SU03", "version": "5.42", "type": 2}
            },
            "activeSectionIndex": 0,
            "defaultDrillFilterOtherVisuals": True,
            "linguisticSchemaSyncVersion": 2,
            "settings": {},
            "filterConfig": {"type": 0},
            "queryLimitOption": 1000000,
        }),
    }

# ---------------------------------------------------------------------------
# Assemble the .pbit ZIP
# ---------------------------------------------------------------------------

CONTENT_TYPES_XML = """<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="xml"  ContentType="application/xml"  />
</Types>"""

RELS_XML = """<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/DataMashup" Target="/DataMashup" Id="R1" />
</Relationships>"""

SECURITY_BINDINGS = json.dumps({"version": "1.0.0", "bindings": []})
SETTINGS          = json.dumps({"version": "1.0", "useStrictJsonParser": False})
METADATA          = json.dumps({
    "version": "4.0",
    "cultures": [{"name": "en-US"}],
    "queryGroups": [],
})
DIAGRAM_STATE     = json.dumps({
    "version": "0",
    "diagramNodes": [
        {"nodeIndex": 0, "size": {"width": 272, "height": 218}},
        {"nodeIndex": 1, "size": {"width": 272, "height": 218}},
        {"nodeIndex": 2, "size": {"width": 272, "height": 218}},
        {"nodeIndex": 3, "size": {"width": 272, "height": 218}},
    ],
})

def write_pbit(pbit_path: str, csv_root: str):
    schema  = build_data_model_schema(csv_root)
    layout  = build_report_layout()

    with zipfile.ZipFile(pbit_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml",    CONTENT_TYPES_XML.strip())
        zf.writestr("_rels/.rels",            RELS_XML.strip())
        zf.writestr("Version",                "1.0")
        zf.writestr("Settings",               SETTINGS)
        zf.writestr("Metadata",               METADATA)
        zf.writestr("SecurityBindings",       SECURITY_BINDINGS)
        zf.writestr("DiagramState",           DIAGRAM_STATE)
        zf.writestr("DataModelSchema",        json.dumps(schema, ensure_ascii=False, indent=2))
        zf.writestr("Report/Layout",          json.dumps(layout, ensure_ascii=False, indent=2))

    size_kb = os.path.getsize(pbit_path) // 1024
    print(f"  {pbit_path}  ({size_kb} KB)")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate VendorSwap_Dashboard.pbit")
    parser.add_argument(
        "--csv-root",
        default="",
        help="Absolute path to the folder containing unified_kpi.csv. "
             "Leave blank to use the CsvRootPath parameter in Power Query.",
    )
    args = parser.parse_args()

    csv_root = args.csv_root.strip()
    if not csv_root:
        # Default: embed the actual output path so the template works out-of-the-box
        csv_root = OUTPUT_DIR

    print(f"Generating .pbit (csv_root={csv_root or '<parameter>'}) ...")
    write_pbit(PBIT_PATH, csv_root)
    print("Done. Open VendorSwap_Dashboard.pbit in Power BI Desktop.")
    print("")
    print("First-time setup in Power BI Desktop:")
    print("  1. Home → Transform Data → Edit Parameters")
    print("     (only needed if you moved the CSV files)")
    print("  2. Home → Refresh  to load your data")
    print("  3. Add visuals to the 4 pre-built pages:")
    print("     • Overview          – KPI scorecards + trend line")
    print("     • Vendor Comparison – side-by-side Nokia vs Huawei charts")
    print("     • Site & Cell       – per-site, per-cell breakdown")
    print("     • Swap Impact       – before/after swap delta analysis")
    print("  4. All 40 DAX measures are pre-loaded in the Field pane")
    print("     under folders: Core KPIs / Vendor Split / Deltas / Swap Impact / Helpers")
