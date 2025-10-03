from flask import Flask, render_template, request, jsonify
from gradio_client import Client
import mysql.connector
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

app = Flask(__name__)

# Connect to your Space
client = Client("SiddharthHanje/Gradio_UI")  # your Space repo name

# Page wont load on its own, copy url in browser
@app.route('/') 
def start():
    return render_template('start.html')

# Home route to handle GET request from the starting page
@app.route('/home', methods=['GET'])
def home():
    return render_template('home.html')

# Global variable to store the last generated query
stored_query = ""
# Route to handle POST request from the interface(yet to be)
@app.route("/home", methods=["POST"])
def text_to_sql():
    body = request.json
    question = body.get("question") or body.get("inputs", {}).get("question")
    schema = body.get("schema") or body.get("inputs", {}).get("schema", "")

    if not question:
        return jsonify({"error": "Question is required"}), 400

    # Call the Space
    result = client.predict(      # .predict will act like an async function
        question=question,
        schema=schema,
        api_name="/predict"  # the top-level interface
    )
    print(result)

    # Extract query part from the result
    query = result.split("SQL:")[-1].strip()
    global stored_query
    stored_query = query  # Store the generated query
    return jsonify({"sql": query})

@app.route("/run_sql", methods=["GET"])
def run_sql_query():
    query = stored_query
    if not query:
        return jsonify({"error": "No SQL query stored"}), 400 
    
    # Database connection
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="S!D@1234",
        database="employee_data"
    )
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(query)
        results = cursor.fetchall()
    except mysql.connector.Error as err:
        results = {"error": str(err)}
    finally:
        cursor.close()
        conn.close()

# Plotting the DataFrame
    df = pd.DataFrame(results)
    # Auto-infer column types
    for col in df.columns:
        try:
            df[col] = pd.to_numeric(df[col])
        except:
            try:
                df[col] = pd.to_datetime(df[col])
            except:
                df[col] = df[col].astype("category")

    cols = df.columns.tolist()
    num_cols = len(cols)

    plt.figure(figsize=(10, 6))

    if num_cols == 1:
        col = cols[0]
        if pd.api.types.is_numeric_dtype(df[col]): # numeric types
            plt.hist(df[col], bins="auto")
            plt.xlabel(col)
            plt.ylabel("Frequency")
            plt.title(f"Distribution of {col}")
        else:  # categorical or text
            counts = df[col].value_counts()
            plt.bar(counts.index, counts.values) # Note: Can also use piechart
            plt.xlabel(col)
            plt.ylabel("Count")
            plt.title(f"Frequency of {col}")
            plt.xticks(rotation=90)

    elif num_cols == 2:
        x, y = cols
        # Determine types and plot accordingly
        
        # Categorical + Numerical → Use a Bar Chart
        if pd.api.types.is_numeric_dtype(df[y]) and pd.api.types.is_categorical_dtype(df[x]):
            plt.bar(df[x], df[y]) # Bar chart with categorical on x-axis
            plt.xlabel(x)
            plt.ylabel(y)
            plt.title(f"{y} vs {x}")
            plt.xticks(rotation=90)
        elif pd.api.types.is_numeric_dtype(df[x]) and pd.api.types.is_categorical_dtype(df[y]):
            plt.bar(df[y], df[x])  # Swapped to keep categorical on x-axis
            plt.xlabel(y)
            plt.ylabel(x)
            plt.title(f"{x} vs {y}")
            plt.xticks(rotation=90)  
        
        # Numerical + Numerical → Use a Scatter Plot
        elif pd.api.types.is_numeric_dtype(df[x]) and pd.api.types.is_numeric_dtype(df[y]):
            plt.scatter(df[x], df[y])
            plt.xlabel(x)
            plt.ylabel(y)
            plt.title(f"{y} vs {x}")
            plt.xticks(rotation=90)

        # Categorical + Categorical → Use a Frequency Chart (e.g., grouped bar or heatmap)    
        elif pd.api.types.is_categorical_dtype(df[x]) and pd.api.types.is_categorical_dtype(df[y]):
            pass  # More complex plotting needed, skipping for simplicity
  

    elif num_cols == 3:
        x, y, hue = cols
        groups = df.groupby(hue)
        for label, group in groups:
            plt.scatter(group[x], group[y], label=label)
        plt.xlabel(x)
        plt.ylabel(y)
        plt.title(f"{y} vs {x} grouped by {hue}")
        plt.legend()

    else:
        print("Unsupported column structure for auto-plotting.")

    plt.tight_layout()
    plt.savefig("static/images/plot.png")
    plt.close()

    return jsonify({"plot_url": "static/images/plot.png"})
if __name__ == "__main__":
    app.run(port=3000)



