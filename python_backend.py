from flask import Flask, render_template, request, jsonify
from gradio_client import Client

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
    return jsonify({"sql": query})

if __name__ == "__main__":
    app.run(port=3000)