import jwt from "jsonwebtoken";

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {

        // destructuring token from headers
        const { atoken } = req.headers;

        if (!atoken) {
            res.json({
                success: false,
                message: "You are not authorized",
            })
        }

        // decode token now
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)

        // check if this token email and passwords match with admin specified in env
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            res.json({
                success: false,
                message: "Only admins can add a doctor",
            })
        }
        next()
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message,
        })

    }
}

export default authAdmin;