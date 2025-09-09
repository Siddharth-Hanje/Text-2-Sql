from flask import Flask, jsonify
import requests

app = Flask(__name__)

# Replace this with your actual Hugging Face Space endpoint
SPACE_API_URL = "https://SiddharthManje-Text_2_SQL.hf.space/run/predict"


@app.route('/')
def query_model():
    # 🧠 Take input from terminal
    question = input("Enter your question: ")
    schema = input("Enter schema (optional): ")

    # 📨 Prepare payload
    payload = {
        "data": [question, schema]
    }

    # ⏳ Send request and wait for response
    print("\nSending request to Hugging Face Space... Waiting for response.")
    try:
        response = requests.post(SPACE_API_URL, json=payload)
        print("✅ Response received.")
        print("🔍 Raw response status:", response.status_code)
        print("🔍 Raw response text:", response.text)
        result = response.json()


        # 🖨️ Print the SQL result
        print("\nGenerated SQL:")
        print(result["data"][0])
    except Exception as e:
        print("\n❌ Error:", str(e))

    return jsonify({"status": "done"})

if __name__ == '__main__':
    # Run the route directly without starting the server
    with app.test_request_context():
        query_model()
