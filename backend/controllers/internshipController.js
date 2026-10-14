
import Internship from "../models/Internship.js";

// Add a new internship
export const addInternship = async (req, res) => {
  try {
    const {
      companyName,
      role,
      location,
      workMode,
      stipend,
      applicationLink,
      status,
      appliedDate,
      interviewDate,
      notes,
    } = req.body;

    if (!companyName || !role) {
      return res.status(400).json({
        message: "Company name and role are required",
      });
    }

    const internship = await Internship.create({
      companyName,
      role,
      location,
      workMode,
      stipend,
      applicationLink,
      status,
      appliedDate,
      interviewDate,
      notes,
    });

    return res.status(201).json({
      message: "Internship added successfully",
      internship,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add internship",
      error: error.message,
    });
  }
};

// Get all internships
export const getInternships = async (req, res) => {
  try {
    const internships = await Internship.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: internships.length,
      internships,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch internships",
      error: error.message,
    });
  }
};


//update

export const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    return res.status(200).json({
      message: "Internship updated successfully",
      internship,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update internship",
      error: error.message,
    });
  }
};


//Delete

export const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(
      req.params.id
    );

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    return res.status(200).json({
      message: "Internship deleted successfully",
      internship,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete internship",
      error: error.message,
    });
  }
};
