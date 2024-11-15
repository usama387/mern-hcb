import express from "express";
import { addDoctor, adminLogin, getAllDoctors } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

// using router instance api endpoints are created
const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/admin-login", adminLogin);
adminRouter.post("/all-doctors",authAdmin, getAllDoctors);

export default adminRouter;