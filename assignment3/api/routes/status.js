const express = require("express");
const router = express.Router();

// Simple "is the API alive?" endpoint.
// Useful for testing Docker setup before adding auth/RBAC.
router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;