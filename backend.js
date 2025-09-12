import { Client } from "@gradio/client";
import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

// Connecting to the Gradio Space
const client = await Client.connect("SiddharthHanje/Gradio_UI");

app.post("/home", async (req, res)=>{    

    // Ensure right question inputs
    const question = (typeof req.body !== "object" ? req.body : req.body?.question || req.body?.inputs?.question) || null;

    // Force question to be a string; fallback to null
    if (typeof question !== "string") {
        return res.status(400).json({ error: "Invalid question" });
    }

    // Ensure right schema inputs
    var schema   = req.body?.schema || req.body?.inputs?.schema || "";

    // Force schema to be a string; fallback to ""
    if (typeof schema !== "string") {
        schema = "";
    }
    
    try{ 
    // Adding Endpoint
    // Setting async function to wait for response from Gradio Space
    const result = await client.predict("/predict", {                     
            question: question,
            schema: schema,
    });
    // Seperate query from response
    const resultStr = typeof result === "string" ? result : JSON.stringify(result);

    const part = resultStr.split("SQL:");
    const query = part[part.length - 1].trim();

    return res.json({ sql: query });
    
    }catch(err){
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
   
});


app.listen(port, () => {
  console.log(`Server is running at Port:${port}`);
});