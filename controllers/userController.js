import validator from "validator";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// api to register user or patient
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.json({
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
      res.json({
        success: false,
        message: "Password should be at least 8 characters",
      });
    }

    // hash the password now
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating new user in the db
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // once user is registered a token is created and mapped with userId to send in response
    const token = jwt.sign(
      {
        id: newUser.id,
      },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist with this email",
      });
    }

    // verifying user entered password with the db password
    const verifyPassword = await bcrypt.compare(password, user.password);

    if (verifyPassword) {
      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET
      );
      return res.json({
        success: true,
        token,
      });
    } else {
      return res.json({
        success: false,
        message: "Incorrect Password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const userData = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        image: true,
        dob: true,
        address: true,
        gender: true,
        phone: true,
      },
    });

    return res.json({
      success: true,
      userData,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to update profile data
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;

    const imageFile = req.file;

    // data check
    if (!userId || !name || !phone || !address || !dob || !gender) {
      return res.json({
        success: false,
        message: "Something missing in the data",
      });
    }

    // Parse address if necessary
    let parsedAddress;
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
    } catch {
      return res.json({
        success: false,
        message: "Invalid address format",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        phone,
        address: parsedAddress,
        dob,
        gender,
      },
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      const imageUrl = imageUpload.secure_url;

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          image: imageUrl,
        },
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to book doctor appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // at first using doc id getting doctors data to perform booking operations
    const doctorData = await prisma.doctor.findFirst({
      where: {
        id: docId,
      },
      select: {
        id: true,
        name: true,
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

    // if doctor not available terminate the function
    if (!doctorData.available) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    // if doctor is available then this variable has details booked slots of the doctor
    let slotsBooked = doctorData.slotsBooked;

    // now checking for slots availability according to the user or patient time and date and then booking slot
    if (slotsBooked[slotDate]) {
      if (slotsBooked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "This slot is already booked",
        });
      } else {
        slotsBooked[slotDate].push(slotTime);
      }
    } else {
      slotsBooked[slotDate] = [];
      slotsBooked[slotDate].push(slotTime);
    }

    const userData = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        address: true,
        gender: true,
        dob: true,
        phone: true,
      },
    });

    delete doctorData.slotsBooked;

    // save appointment with the data
    const newAppointment = await prisma.appointment.create({
      data: {
        userId,
        docId,
        userData,
        docData: doctorData,
        amount: doctorData.fees,
        slotTime,
        slotDate,
        date: Math.floor(Date.now() / 1000),
      },
    });

    // update slots for other patients / users in doctor data
    await prisma.doctor.update({
      where: {
        id: docId,
      },
      data: { slotsBooked: slotsBooked },
    });

    return res.json({
      success: true,
      message: "Appointment booked",
      appointment: newAppointment,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment };
