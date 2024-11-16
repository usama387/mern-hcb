import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";

// api for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const imageFile = req.file;

    // field checks
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({
        success: false,
        message: "Something missing in the data",
      });
    }

    // validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Invalid Email",
      });
    }

    // validate strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters",
      });
    }

    // hash the password now
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;
    const newDoctor = await prisma.doctor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: imageUrl,
        speciality,
        degree,
        experience,
        about,
        fees: parseInt(fees, 10),
        address: JSON.parse(address),
        date: Date.now(),
      },
    });

    res.json({
      success: true,
      message: "New doctor added in the system",
      newDoctor,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: true,
      message: error.message,
    });
  }
};

// api for admin login returns a token that is saved in user browser with local storage to determine admin
const adminLogin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.json({
        success: true,
        token,
      });
    } else {
      res.json({
        success: false,
        message: "You are not an admin",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to get all doctors list for admin panel
const getAllDoctors = async (req, res) => {
  try {
    const allDoctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        speciality: true,
        degree: true,
        experience: true,
        about: true,
        available: true,
        fees: true,
        address: true,
        date: true,
        slotsBooked: true,
      },
    });

    res.json({
      success: true,
      allDoctors,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { addDoctor, adminLogin, getAllDoctors };
