
import express from "express";
import {
  addInternship,
  getInternships,
  updateInternship,
  deleteInternship,
} from "../controllers/internshipController.js";

const router = express.Router();

router.post("/", addInternship);
router.get("/", getInternships);
router.put("/:id", updateInternship);
router.delete("/:id", deleteInternship);

export default router;
