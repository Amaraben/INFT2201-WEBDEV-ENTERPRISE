const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "elrepyhauntisaorescuftej";

// TODO: Implement authenticateJWT middleware for Assignment 3.
// Requirements:
// - Read the Authorization header: "Bearer <token>".
// - Verify the token using jwt.verify and SECRET.
// - If valid, attach the decoded payload to req.user.
// - If missing/invalid/expired, pass an appropriate error into next(err)
//   (do NOT send the response directly here — let errorHandler.js do that).

module.exports = function authenticateJWT(req, res, next) {
  // TODO: implement
  const authHeader = req.headers.authorization;
// - Read the Authorization header: "Bearer <token>".

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

// - Verify the token using jwt.verify and SECRET.

    jwt.verify(token, SECRET, (err, decoded) => {

      if (err) {
        const error = new Error("Invalid or expired token");
        error.name = "ForbiddenError";
        return next(error);
    }
// - If valid, attach the decoded payload to req.user.

    req.user = decoded;
    next();
  });
} else {
// - If missing/invalid/expired, pass an appropriate error into next(err)

  const error = new Error("Authorization header missing or malformed");
  error.statusCode = 401;
  error.name ="UnauthorizedError";
  next(error);
  }
};