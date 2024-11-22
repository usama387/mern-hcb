import express from "express";
import cors from "cors";
import "dotenv/config";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;
connectCloudinary();

// middlewares
app.use(express.json());

// Define your CORS options
const corsOptions = {
  origin: [
    "https://mern-hca.vercel.app",
    "https://project-healthcare-frontend.vercel.app",
  ],
  credentials: true, // To allow cookies or authentication headers
};

app.use(cors(corsOptions));

//admin api end point
app.use("/api/admin", adminRouter);

//doctor api end point
app.use("/api/doctor", doctorRouter);

//user or patient api end point
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("api working greats");
});

// start express app
app.listen(port, () => {
  console.log(`The server is running on ${port}`);
});

// Export the app for Vercel
// export default app;
