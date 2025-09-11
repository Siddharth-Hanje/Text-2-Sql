import express from "express";

const app = express();

// To parse req.body
app.use(express.json());

// Endpoint
const Space_URL = "https://api-inference.huggingface.co/models/SiddharthHanje/Gradio_UI";

app.post("/home", async (req, res)=>{                                
    try{
        const{question, schema} = req.body;

        if (!question){
            return res.status(400).json({error: "Question {question} is required"});
        }
        const response = await fetch(Space_URL,{                     // Await used to holding till response is recovered
            method: "POST",
            headers: {
                "Content-Type":"application/json"},                  // Json mediatype: Telling server to expect json
            body: JSON.stringify({
                inputs: { question, schema: schema || "" }
            }),               
        });

        // Return model response when available
        const result = await response.json();
        res.json(result);
    }catch(err){
       console.error(err);
       res.status(500).json({error: "Somethhing went wrong"});
    }
});

//Starting Server
const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
});
