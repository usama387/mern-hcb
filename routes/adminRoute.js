import express from "express";
import { addDoctor, adminLogin } from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

// using router instance api endpoints are created
const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/admin-login", adminLogin);

export default adminRouter;