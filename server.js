import express from "express";
import cors from "cors";
import "dotenv/config";
import connectCloudinary from "./config/cloudinary.js";


// app config
const app = express();
const port = process.env.PORT || 4000;
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors())


// api end points
app.get('/', (req, res) => {
    res.send("api working greats")
})

// start express app
app.listen(port, () => {
    console.log(`The server is running on ${port}`)
})

