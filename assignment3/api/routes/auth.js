const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "elrepyhauntisaorescuftej";

// POST /login
// Body: { username, password }
// On success: return a JWT that includes { userId, role } as claims.
router.post("/login", (req, res, next) => {
  // TODO: implement:
  const { username, password } = req.body;

  // - Look up user in users.js
  const user = users.find(u => u.username === username && u.password === password);
  // - Check password (plain text is fine for this assignment)
  // - If invalid, pass an appropriate auth error into next(err)
  if (!user) {
    const err = new Error("Invalid username or password");
    err.statusCode = 401;
    err.name = "AuthenticationError";
    return next(err);
  }

  // - If valid, sign a JWT and return { token }
  const token = jwt.sign(
    { userID: user.user, role: user.role },
    SECRET,
    { expiresIn : '1h'}
  );
  res.json({ token });
});

module.exports = router;