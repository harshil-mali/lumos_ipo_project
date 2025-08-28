from flask import Flask, jsonify, render_template
import mysql.connector

app = Flask(__name__)

db_connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="chittorghar"
)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/full_list')
def full_list():
    return render_template('full_list.html')


@app.route('/api/ipo_summary')
def get_ipo_summary():
    cursor = db_connection.cursor(dictionary=True)
    query = "SELECT company_name, opening_date, closing_date FROM ipo_list LIMIT 10"
    cursor.execute(query)
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)


@app.route('/api/ipo_full')
def get_ipo_full():
    cursor = db_connection.cursor(dictionary=True)
    query = "SELECT company_name, opening_date, closing_date, listing_date, issue_price, issue_amount, listing_at, lead_manager FROM ipo_list"
    cursor.execute(query)
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)




@app.route('/company/<company_name>')
def company_detail(company_name):
    cursor = db_connection.cursor(dictionary=True)

    # Fetch data from ipo_details table
    details_query = "SELECT * FROM ipo_details WHERE company_name = %s"
    cursor.execute(details_query, (company_name,))
    company_data = cursor.fetchone()

    # Fetch data from ipo_timeline table
    timeline_query = "SELECT * FROM ipo_timeline WHERE company_name = %s"
    cursor.execute(timeline_query, (company_name,))
    timeline_data = cursor.fetchone()

    # 👉 New: Fetch data from ipo_reservation_df table
    reservation_query = "SELECT * FROM ipo_reservation_df WHERE company_name = %s"
    cursor.execute(reservation_query, (company_name,))
    reservation_data = cursor.fetchone()

    #Fetch data from ipo_lot_size table
    lot_size_query = "SELECT * FROM ipo_lot_size WHERE company_name = %s"
    cursor.execute(lot_size_query, (company_name,))
    lot_size_data = cursor.fetchone()  # Use fetchall() as there can be multiple rows for different investor types

    cursor.close()

    if company_data:
        # Pass all four sets of data to the template
        return render_template(
            'company_detail.html',
            company=company_data,
            timeline=timeline_data,
            reservation=reservation_data,
            lot_size=lot_size_data
        )
    else:
        return "Company details not found", 404

if __name__ == '__main__':
    app.run(debug=True)