
document.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        alert("Key pressed");     
    }
});

const Language_Form = document.querySelector("#Language_Form");

Language_Form.addEventListener("submit",  async function(event){
    event.preventDefault();

    const question = document.querySelector("#language_input").value;
    const schema = document.querySelector("#Schema_input").value;


    // Basic validation
    if (!question || question.trim() === '') {
        alert("Question cannot be empty.");
        return;
    };

    if (question.trim().length < 5)  {
       alert("Question is too short to be a valid.");
       return;
    };
    
    const NumericOnly = /^\s*\d+\s*$/;
    const TooSymbolic = /^[\W_]+$/;

    if (NumericOnly.test(question) || TooSymbolic.test(question)) {
        alert("Question input looks only numeric/symbolic.");
    return;
   }

    const keyValPattern = /(\w+\s*[:=]\s*\w+)/;
    if (keyValPattern.test(question)) {
        alert("Question should be a natural language question, not key-value pairs.");
        return;
    };


    // Schema validation 
    if (schema && schema.trim() !== '') {
        if (schema.trim().length < 5)  {
            alert("Schema input is too short to be a valid.");
            return;
        };
        if (NumericOnly.test(schema) || TooSymbolic.test(schema)) {
            alert("Schema input looks only numeric/symbolic.");
            return;
        };

        if (keyValPattern.test(schema)) {
            alert("Schema input should be a natural language question, not key-value pairs.");
            return;
        };            
    };
    alert("Inputs look good. Sending request...");

    // Send data to server
    try{

        const payload = {
            "question": question,
            "schema": schema   
        };
        const response = await fetch('/home', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)

        });

        if (!response.ok) {
            alert("Server responded with error: " + response.status);
            return;
    }
        alert("Request sent and server responded with status: " + response.status);

        const result = await response.json();
        const sql_query = result.sql;

        alert("Generated SQL: " + sql_query);
        const outputBox = document.querySelector("#output");
        outputBox.value = sql_query || "No SQL returned.";

        const visualizeButton = document.querySelector("#visualize_button");
        visualizeButton.disabled = false;  // Enable the button now

    } catch (error) {
        alert("Error occurred while fetching:" + error);
    }

});

const visualizeButton = document.querySelector("#visualize_button");

visualizeButton.addEventListener("click", async function() {
    try {
        const response = await fetch('/run_sql');  

        if (!response.ok) {
            alert("Visualization failed: " + response.status);
            return;
        }
        alert("Visualization triggered successfully.");
        const result = await response.json();
        const imageUrl = result.plot_url;

        const plotImage = document.querySelector("#plot_image");
        const timestamp = new Date().getTime(); 
        plotImage.src = `/${imageUrl}?t=${timestamp}`;
        plotImage.alt = "Generated Visualization";

    } catch (error) {
        alert("Error during visualization: " + error);
    }
});

