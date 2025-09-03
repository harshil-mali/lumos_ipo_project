#!/usr/bin/env python
# coding: utf-8

# In[1]:


import requests
import re
import json 
import requests
import pandas as pd
from bs4 import BeautifulSoup
from io import StringIO
import os
from urllib.parse import urljoin, urlparse



# In[2]:


url = "https://webnodejs.chittorgarh.com/cloud/report/data-read/82/1/9/2025/2025-26/0/all/0?search=&v=15-34"
headers = {"User-Agent": "Mozilla/5.0"}

response = requests.get(url, headers=headers)
data = response.json()

ipo_list = data['reportTableData']

clean_data = []
for ipo in ipo_list:
    company = BeautifulSoup(ipo['Company'], 'html.parser').get_text(strip=True)
    lead_manager = BeautifulSoup(ipo['Lead Manager'], 'html.parser').get_text(strip=True)
    
    clean_data.append({
        "company_name": company,
        "opening_date": ipo['Opening Date'],
        "closing_date": ipo['Closing Date'],
        "listing_date": ipo['Listing Date'] if ipo['Listing Date'] else ipo.get('~ListingDate', ''),
        "issue_price_rs": ipo['Issue Price (Rs.)'],
        "issue_amount_cr": ipo['Total Issue Amount (Incl.Firm reservations) (Rs.cr.)'],
        "listing_at": ipo['Listing at'],
        "lead_manager": lead_manager
    })


# In[3]:


all_ipo_page_tabel = pd.DataFrame(clean_data)


# In[4]:


all_ipo_page_tabel


# In[5]:


# chitorghar na mainboard ma jase and  anchore tage mathi badhi ipo ni hyoerlinks ne fetch karse detail page na ipo ni 

company_links = []
for item in data['reportTableData']:
    company_html = item['Company']
    soup = BeautifulSoup(company_html, "html.parser")
    a_tag = soup.find("a")
    if a_tag:
        company_links.append({
            "Company Name": a_tag.text.strip(),
            "URL": a_tag["href"]
        })


# In[6]:


company_links


# ipo detail page ma details vadu tabel fetch kare ce

# In[7]:


all_ipo_data = []

for comp in company_links:
        df = pd.read_html(requests.get(comp["URL"], headers=headers).text)[0]
        df.columns = ["Field", "Value"]
        record = {"Company Name": comp["Company Name"], **dict(zip(df["Field"], df["Value"]))}
        all_ipo_data.append(record)


detail_page_detail_tabel = pd.DataFrame(all_ipo_data)

# ipo_master_df["issue_price"] = ipo_master_df["Issue Price"].fillna(ipo_master_df["Issue Price Band"])
# ipo_details_df = ipo_master_df.drop(columns=['Issue Price','Issue Price Band','Reserved for Employees','Net Offered to Public'])
# ipo_details_df
detail_page_detail_tabel = detail_page_detail_tabel.rename(columns={"Company Name":"company_name","IPO Date":"ipo_date","Listing Date":"listing_date",
                                        "Lot Size":"lot_size","Sale Type":"sale_type","Total Issue Size":"total_issue_size","Face Value":"face_value","Issue Price":"issue_price_rs",
                                        "Issue Type":"issue_type","Listing At":"listing_at","Share Holding Pre Issue":"share_holding_pre_issue",
                                        "Share Holding Post Issue":"share_holding_post_issue","Fresh Issue":"fresh_issue","Offer for Sale":"offer_for_sale",
                                        "Employee Discount":"employee_dicuount"})
detail_page_detail_tabel['fresh_issue'] = detail_page_detail_tabel['Fresh Issue (Ex Market Maker)'].fillna(detail_page_detail_tabel['fresh_issue'])
detail_page_detail_tabel['issue_price_rs'] = detail_page_detail_tabel['Issue Price Band'].fillna(detail_page_detail_tabel['issue_price_rs'])
detail_page_detail_tabel = detail_page_detail_tabel.drop(columns=['Issue Price Band','Fresh Issue (Ex Market Maker)','Reserved for Employees','Reserved for Private Promoter'])
detail_page_detail_tabel = detail_page_detail_tabel.rename(columns={"Reserved for Market Maker":"reserved_for_makret_maker","Net Offered to Public":"net_offered_to_public"})


# In[8]:


# detail_page_detail_tabel


# In[9]:


# pd.set_option('display.max_columns', None)
# pd.set_option('display.max_rows', None)


# In[10]:


# reservation tabele 


# In[ ]:





# # RESERVATION TABEL 

# In[11]:


all_ipo_data = []

for comp in company_links:
    html = requests.get(comp['URL'], headers=headers).text
    tables = pd.read_html(html)

    if len(tables) > 1:   
        df = tables[1].copy()

        if df.shape[1] >= 2:
            if df.shape[1] == 2:
                df.columns = ["Field", "Value"]
            elif df.shape[1] >= 3:
                df = df.iloc[:, :3]  
                df.columns = ["Field", "Value", "Extra"]

            record = {"Company Name": comp["Company Name"]}

            for _, row in df.iterrows():
                field = str(row["Field"]).strip()
                record[field] = row["Value"]
                if "Extra" in df.columns:
                    record[f"{field} - Extra"] = row["Extra"]

            all_ipo_data.append(record)

detail_page_reservation_tabel = pd.DataFrame(all_ipo_data)







detail_page_reservation_tabel["nii_shares_offered_final"] = detail_page_reservation_tabel["NII Shares Offered"].fillna(detail_page_reservation_tabel["NII (HNI) Shares Offered"])
rename_column = {
    "Company Name": "company_name",
    "QIB Shares Offered": "qib_shares_offered",
    "QIB Shares Offered - Extra": "qib_shares_offered_max_allottees",
    "− QIB (Ex. Anchor) Shares Offered": "qib_ex_anchor_shares_offered",
    "− QIB (Ex. Anchor) Shares Offered - Extra": "qib_ex_anchor_shares_offered_max_allottees",

    "− Anchor Investor Shares Offered": "anchor_investor_shares_offered",
    "− Anchor Investor Shares Offered - Extra": "anchor_investor_shares_offered_max_allottees",

#     "NII (HNI) Shares Offered": "nii_hni_shares_offered",
    "NII (HNI) Shares Offered - Extra": "nii_hni_shares_offered_max_allottees",

    "− bNII > ₹10L": "bnii_above_10L",
    "− bNII > ₹10L - Extra": "bnii_above_10L_max_allottees",
    "− sNII < ₹10L": "snii_below_10L",
    "− sNII < ₹10L - Extra": "snii_below_10L_max_allottees",

    "Retail Shares Offered": "retail_shares_offered",
    "Retail Shares Offered - Extra": "retail_shares_offered_max_allottees",

    "Employee Shares Offered": "employee_shares_offered",
    "Employee Shares Offered - Extra": "employee_shares_offered_max_allottees",

    "Shareholders Shares Offered": "shareholders_shares_offered",
    "Shareholders Shares Offered - Extra": "shareholders_shares_offered_max_allottees",

    "Total Shares Offered": "total_shares_offered",
    "Total Shares Offered - Extra": "total_shares_offered_max_allottees",

    "Market Maker Shares Offered": "market_maker_shares_offered"
}
detail_page_reservation_tabel = detail_page_reservation_tabel.drop(columns=["NII Shares Offered", "NII (HNI) Shares Offered"])
detail_page_reservation_tabel = detail_page_reservation_tabel.rename(columns=rename_column)


# In[12]:


# detail_page_reservation_tabel.shape


# In[ ]:





# RESERVATION TABEL NOJ CODE CE PAN 2 COLUMN MATE CE SAVE RAKHVO AAGAD KYAK KAM LAGI SAKE CE 

# In[13]:


# all_ipo_data = []

# for comp in company_links:
#     comp_url = urljoin("https://www.chittorgarh.com/", comp["URL"])
    
#     html = requests.get(comp_url, headers=headers).text
#     tables = pd.read_html(html)
    
#     if len(tables) > 1:   
#         df = tables[1].copy()
        
#         if df.shape[1] >= 2:
#             df = df.iloc[:, :2]   
#             df.columns = ["Field", "Value"]
            
#             record = {"Company Name": comp["Company Name"], **dict(zip(df["Field"], df["Value"]))}
#             all_ipo_data.append(record)
       
   


#  RESRVATION TABEL NO CODE CE  PAN NON SME IPO MATE CE AND AA WORK NAHI KARE KM KE NON SME IPO MA 2 COLUMN HOY CE TABEL MA AND SME MA 3  TO SHAPE NOT MATCH NI ERROR AAVSE  BUT STILL CODE SAVE RAKHVO 

# In[14]:


# ipo_reservation = []
# for comp in company_links:
#     try:
#         page = requests.get(comp["URL"], headers=headers)
#         tables = pd.read_html(page.text)
        
#         if len(tables) > 1:
#             df = tables[1]

#             if df.shape[1] >= 3:
#                 df = df.iloc[:, :3]  
#                 df.columns = ["Investor Category", "Shares Offered", "Maximum Allottees"]

#                 record = {"Company Name": comp["Company Name"]}
#                 for _, row in df.iterrows():
#                     record[f"{row['Investor Category']} - Shares Offered"] = row["Shares Offered"]
#                     record[f"{row['Investor Category']} - Maximum Allottees"] = row["Maximum Allottees"]

#                 ipo_reservation.append(record)
#     except Exception as e:
#         print(f"Error processing {comp['Company Name']}: {e}")

# # Step 4: Create final DataFrame
# ipo_reservation_df = pd.DataFrame(ipo_reservation)
# ipo_reservation_df = ipo_reservation_df.drop(columns=['Shareholders Shares Offered - Maximum Allottees','Employee Shares Offered - Maximum Allottees','Total Shares Offered - Maximum Allottees','− Anchor Investor Shares Offered - Maximum Allottees','QIB Shares Offered - Maximum Allottees','NII (HNI) Shares Offered - Maximum Allottees','− QIB (Ex. Anchor) Shares Offered - Maximum Allottees'])



# In[ ]:





# # TIMELINE NO CODE

# In[ ]:





# In[15]:


# fetch IPO Timeline (Tentative Schedule)



structured_data = []

for company in company_links:
        company_name = company["Company Name"]
        company_url = company["URL"]
        response = requests.get(company_url, headers=headers)
        soup = BeautifulSoup(response.content, "html.parser")

        tables = soup.find_all("table")

        for table in tables:
            if "Initiation of Refunds" in table.get_text():
                df = pd.read_html(str(table))[0]

                if df.shape[1] == 2:
                    row_data = {"Company Name": company_name}
                    for i in range(len(df)):
                        key = df.iloc[i, 0].strip()
                        value = df.iloc[i, 1]
                        row_data[key] = value
                    structured_data.append(row_data)

final_df_timeline = pd.DataFrame(structured_data)

detail_page_timeline_tabel = final_df_timeline.rename(columns={
    "Company Name": "company_name",
    "IPO Open Date": "opening_date",
    "IPO Close Date": "closing_date",
    "Tentative Allotment": "tentative_allotment",
    "Initiation of Refunds": "initiation_of_refunds",
    "Credit of Shares to Demat": "credit_of_shares",
    "Tentative Listing Date": "tentative_listing_date",
    "Cut-off time for UPI mandate confirmation": "cut_off_for_upi_mandate"
})


# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[16]:


# fetch IPO Lot Size tabel  

structured_data_lot = []

for company in company_links:
        company_name = company["Company Name"]
        company_url = company["URL"]
        response = requests.get(company_url, headers=headers)
        soup = BeautifulSoup(response.content, "html.parser")

        tables = soup.find_all("table")

        for table in tables:
            if "Lots" in table.get_text():
                df = pd.read_html(str(table))[0]

                df["Company Name"] = company_name

                df_pivot = df.pivot_table(
                    index="Company Name",
                    columns="Application",
                    values=["Lots", "Shares", "Amount"],
                    aggfunc="first"
                )

                df_pivot.columns = [f"{col2}_{col1}" for col1, col2 in df_pivot.columns]
                df_pivot = df_pivot.reset_index()

                structured_data_lot.append(df_pivot)

final_df_lot = pd.concat(structured_data_lot, ignore_index=True)
detail_page_lot_tabel=final_df_lot.rename(columns={
    "Company Name": "company_name",
    "B-HNI (Min)_Amount": "b_hni_min_amount",
    "Retail (Max)_Amount": "retail_max_amount",
    "Retail (Min)_Amount": "retail_min_amount",
    "S-HNI (Max)_Amount": "s_hni_max_amount",
    "S-HNI (Min)_Amount": "s_hni_min_amount",
    "B-HNI (Min)_Lots": "b_hni_min_lots",
    "Retail (Max)_Lots": "retail_max_lots",
    "Retail (Min)_Lots": "retail_min_lots",
    "S-HNI (Max)_Lots": "s_hni_max_lots",
    "S-HNI (Min)_Lots": "s_hni_min_lots",
    "B-HNI (Min)_Shares": "b_hni_min_shares",
    "Retail (Max)_Shares": "retail_max_shares",
    "Retail (Min)_Shares": "retail_min_shares",
    "S-HNI (Max)_Shares": "s_hni_max_shares",
    "S-HNI (Min)_Shares": "s_hni_min_shares",
    "Employee (Max)_Amount":"employee_max_amount",
    "Employee (Max)_Lots":"employee_max_lots",
    "Employee (Max)_Shares":"employee_max_shares",
    "Employee (Min)_Amount":"employee_min_amount",
    "Employee (Min)_Lots":"employee_min_lots",
    "Employee (Min)_Shares":"employee_min_shares",
    "All Investors_Amount":"all_investors_amount",
    "All Investors_Lots":"all_investors_lots",
    "All Investors_Shares":"all_investors_shares",
    "HNI (Min)_Amount":"hni_min_amount",
    "HNI (Min)_Lots":"hni_min_lots",
    "HNI (Min)_Shares":"hni_min_shares"
    
})





detail_page_lot_tabel['retail_max_amount'] = detail_page_lot_tabel['Individual investors (Retail) (Max)_Amount'].fillna(detail_page_lot_tabel['retail_max_amount'])
detail_page_lot_tabel['retail_max_lots'] = detail_page_lot_tabel['Individual investors (Retail) (Max)_Lots'].fillna(detail_page_lot_tabel['retail_max_lots'])
detail_page_lot_tabel['retail_max_shares'] = detail_page_lot_tabel['Individual investors (Retail) (Max)_Shares'].fillna(detail_page_lot_tabel['retail_max_shares'])


detail_page_lot_tabel['retail_min_amount'] = detail_page_lot_tabel['Individual investors (Retail) (Min)_Amount'].fillna(detail_page_lot_tabel['retail_min_amount'])
detail_page_lot_tabel['retail_min_lots'] = detail_page_lot_tabel['Individual investors (Retail) (Min)_Lots'].fillna(detail_page_lot_tabel['retail_min_lots'])
detail_page_lot_tabel['retail_min_shares'] = detail_page_lot_tabel['Individual investors (Retail) (Min)_Shares'].fillna(detail_page_lot_tabel['retail_min_shares'])




detail_page_lot_tabel = detail_page_lot_tabel.drop(columns=['Individual investors (Retail) (Max)_Amount','Individual investors (Retail) (Max)_Lots','Individual investors (Retail) (Max)_Shares','Individual investors (Retail) (Min)_Amount','Individual investors (Retail) (Min)_Lots','Individual investors (Retail) (Min)_Shares'])


# In[17]:


# detail_page_lot_tabel.columns


# In[18]:


# detail_page_lot_tabel.shape


# In[ ]:





# In[ ]:





# In[19]:


# Financial Information (Restated Standalone) tabel 

structured_tables_finance = []

for company in company_links:
        company_name = company["Company Name"]
        company_url = company["URL"]
        response = requests.get(company_url, headers=headers)
        soup = BeautifulSoup(response.content, "html.parser")

        tables = soup.find_all("table")

        for table in tables:
            if "Period Ended" in table.get_text():
                df = pd.read_html(str(table))[0]
                df["Company Name"] = company_name
                structured_tables_finance.append(df)
final_df_finance = pd.concat(structured_tables_finance, ignore_index=True)
final_df_finance = final_df_finance[~final_df_finance[0].isin(["Amount in ₹ Crore", "Revenue"])].reset_index()
final_df_finance=final_df_finance[final_df_finance[0].notna()].drop(columns='index')
final_df_finance=final_df_finance.drop(columns=[4,5])



df = final_df_finance.copy()
df.columns = ["metric", "2025", "2024", "2023", "company_name"]
df_long = df.melt(
    id_vars=["metric", "company_name"],
    value_vars=["2025", "2024", "2023"],
    var_name="period_end",
    value_name="value"
)
df_wide = df_long.pivot_table(
    index=["company_name", "period_end"],
    columns="metric",
    values="value",
    aggfunc="first"
).reset_index().sort_index()
df_wide.drop(columns='period_end')


detail_page_finance_tabel = df_wide.rename(columns={
    "Assets": "assets",
    "Period Ended":"period_ended",
    "Total Income": "total_income",
    "Profit After Tax": "profit_after_tax",
    "EBITDA": "ebita",
    "Net Worth": "networth",
    "Reserves and Surplus": "reserves_and_surplus",
    "Total Borrowing": "total_borrowing"
})


detail_page_finance_tabel = detail_page_finance_tabel.drop(columns=['Amount in ₹ Lakhs','Period Ended (In Crore)'])
detail_page_finance_tabel.loc[
    (detail_page_finance_tabel["company_name"] == "Current Infraprojects Ltd. IPO") & 
    (detail_page_finance_tabel["period_ended"].isna()), 
    "period_ended"
] = "Mar 31, 2024"



# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[20]:


# FETCH KPI TABLE FROM LINKS
roce_tables = []

for company in company_links:
        company_name = company["Company Name"]
        company_url = company["URL"]
        response = requests.get(company_url, headers=headers)
        soup = BeautifulSoup(response.content, "html.parser")

        tables = soup.find_all("table")

        for table in tables:
            if "KPI" in table.get_text():
                df = pd.read_html(str(table))[0]
                df["Company Name"] = company_name
                roce_tables.append(df)
final_df_kpi = pd.concat(roce_tables, ignore_index=True)

final_df_kpi = final_df_kpi.pivot(index="Company Name", columns="KPI", values="Values").reset_index()

detail_page_kpi_tabel=final_df_kpi.rename(columns={"Company Name":"company_name",
                         "Debt/Equity":"debt_equity",
                         "EBITDA Margin":"ebitda_margin",
                         "PAT Margin":"pat_margin",
                         "Price to Book Value":"price_to_book_value",
                         "ROCE":"roce",
                         "ROE":"roe",
                         "RoNW":'ronw'})


# In[21]:


detail_page_kpi_tabel


# In[22]:


all_ipo_page_tabel.shape


# In[ ]:





# In[23]:


promoter_tables = []
for company in company_links:
    company_name = company["Company Name"]
    company_url = company["URL"]
    response = requests.get(company_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")

    tables = soup.find_all("table")

    for table in tables:
        table_text = table.get_text()
        if "Promoter Holding Pre Issue" in table_text:
            df = pd.read_html(str(table))[0]
            df["Company Name"] = company_name
            promoter_tables.append(df)

final_df_promoter = pd.concat(promoter_tables, ignore_index=True)
final_df_promoter = final_df_promoter.pivot(index="Company Name", columns=0,values=1).reset_index()
detail_page_promoter_tabel = final_df_promoter.rename(columns={
    'Company Name':'company_name',
    'Promoter Holding Post Issue': 'prmoter_holding_post_issue',
    'Promoter Holding Pre Issue': 'prmoter_holding_pre_issue',
  
})


# In[ ]:





# In[ ]:





# In[ ]:





# In[24]:


pre_tables = []
for company in company_links:
    company_name = company["Company Name"]
    company_url = company["URL"]
    response = requests.get(company_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")

    tables = soup.find_all("table")

    for table in tables:
        table_text = table.get_text()
        if "Pre IPO" in table_text:
            df = pd.read_html(str(table))[0]
            df["Company Name"] = company_name
            pre_tables.append(df)

final_df_pre = pd.concat(pre_tables, ignore_index=True)



final_df_pre = final_df_pre.pivot(index='Company Name', columns='Unnamed: 0', values=['Pre IPO', 'Post IPO'])

final_df_pre.columns = [f"{col[0]} {col[1]}" for col in final_df_pre.columns]

final_df_pre = final_df_pre.reset_index()

detail_page_pre_tabel = final_df_pre.rename(columns={
    'Pre IPO EPS (Rs)': 'eps_pre_ipo',
    'Post IPO EPS (Rs)': 'eps_post_ipo',
    'Pre IPO P/E (x)': 'pe_pre_ipo',
    'Post IPO P/E (x)': 'pe_post_ipo'
})



# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# company about detail fetch 

# In[25]:


company_details = []

for company in company_links:
    company_name = company["Company Name"]
    company_url = company["URL"]
    
    if not company_url.startswith("http"):
        company_url = urljoin("https://webnodejs.chittorgarh.com", company_url)
    
    response = requests.get(company_url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    
    ipo_summary_div = soup.find("div", id="ipoSummary")
    
    if ipo_summary_div:
        ipo_text = "\n".join([p.get_text(strip=True) for p in ipo_summary_div.find_all(["p", "li","strong"])])
    else:
        ipo_text = ""
    
    company_details.append({
        "Company Name": company_name,
        "IPO Summary": ipo_text
    })

final_df_about = pd.DataFrame(company_details)


detail_page_about_tabel = final_df_about.rename(columns={"Company Name":"company_name","IPO Summary":"ipo_summary"})


# In[ ]:





# In[26]:


# company_details = []

# for company in company_links:
#     company_name = company["Company Name"]
#     company_url = company["URL"]
    
#     if not company_url.startswith("http"):
#         company_url = urljoin("https://webnodejs.chittorgarh.com", company_url)
    
#     response = requests.get(company_url, headers=headers)
#     soup = BeautifulSoup(response.content, "html.parser")
    
#     ipo_summary_div = soup.find("div", id="ipoSummary")
    
#     if ipo_summary_div:
#         ipo_text = "\n".join([p.get_text(strip=True) for p in ipo_summary_div.find_all(["p", "li","strong"])])
#     else:
#         ipo_text = ""
    
#     company_details.append({
#         "Company Name": company_name,
#         "IPO Summary": ipo_text
#     })

# final_df_about = pd.DataFrame(company_details)


# detail_page_about_tabel = final_df_about.rename(columns={"Company Name":"company_name","IPO Summary":"ipo_summary"})


# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[27]:


# detail_page_about_tabel


# In[32]:


from sqlalchemy import create_engine


# In[33]:


engine = create_engine("mysql+pymysql://root:@localhost:3306/ipo_databased")


# In[34]:


detail_page_detail_tabel.to_sql("ipo_details", con=engine, if_exists="replace", index=False)
detail_page_timeline_tabel.to_sql("ipo_timeline", con=engine, if_exists="replace", index=False)
detail_page_reservation_tabel.to_sql("ipo_reservation", con=engine, if_exists="replace", index=False)
detail_page_lot_tabel.to_sql("ipo_lot", con=engine, if_exists="replace", index=False)
detail_page_finance_tabel.to_sql("ipo_finance", con=engine, if_exists="replace", index=False)
detail_page_kpi_tabel.to_sql("ipo_kpi", con=engine, if_exists="replace", index=False)
detail_page_pre_tabel.to_sql("ipo_pre", con=engine, if_exists="replace", index=False)
detail_page_about_tabel.to_sql("ipo_about", con=engine, if_exists="replace", index=False)
detail_page_promoter_tabel.to_sql("ipo_promoter", con=engine, if_exists="replace", index=False)


# In[ ]:





# In[ ]:




