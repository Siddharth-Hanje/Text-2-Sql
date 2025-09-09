import express from "express";

const app = express();

//Starting Server
const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
})
