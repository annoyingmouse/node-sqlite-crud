import express from "express";
const router = express.Router();
import { authMiddleware } from "./authMiddleware.js";

//This is a protected route - we pass in the authMiddleware function to verify the JWT token before returning anything.
router.get("/", authMiddleware, (req, res) => {
  res.send(`This is a protected route - your user ID is: ${req.user.id}`);
});

export default router;
