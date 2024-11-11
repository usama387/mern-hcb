import express from "express";
import cors from "cors";
import "dotenv/config";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";


// app config
const app = express();
const port = process.env.PORT || 4000;
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors())


// api end points
app.use("/api/admin", adminRouter)
//localhost:4000/api/admin/add-doctor



app.get('/', (req, res) => {
    res.send("api working greats")
})

// start express app
app.listen(port, () => {
    console.log(`The server is running on ${port}`)
})

