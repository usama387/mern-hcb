import jwt from "jsonwebtoken";

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    // destructuring token from headers
    const { token } = req.headers;

    if (!token) {
      res.json({
        success: false,
        message: "You are not authorized",
      });
    }

    // decode token now
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // when token is sent at the time of reg or login from api it is embedded with userId which is i can access userId from token with this middleware
    req.body.userId = token_decode.id;

    next();
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authUser;
