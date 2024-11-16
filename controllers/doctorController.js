import prisma from "../config/prisma.js";

// api to change availability of doctor based and will be accessible in both admin and doctor panel
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await prisma.doctor.findFirst({
      where: {
        id: docId,
      },
    });

    // now update the availability field using existing doc data
    if (docData) {
      await prisma.doctor.update({
        where: {
          id: docId,
        },
        data: {
          available: !docData.available,
        },
      });
    }

    res.json({
      success: true,
      message: "Modified Availability",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to get all doctors
const doctorsList = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
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

    res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { changeAvailability, doctorsList };
