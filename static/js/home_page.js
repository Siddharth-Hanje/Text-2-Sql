
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
        console.log("SQL result:", result.sql);
        alert("Generated SQL: " + result.sql);

    } catch (error) {
        alert("Error occurred while fetching:" + error);
    }

});