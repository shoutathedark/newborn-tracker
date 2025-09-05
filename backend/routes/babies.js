const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Baby = require("../models/baby");
const auth = require("../middleware/auth");

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Create baby (logged-in caregiver becomes linked)
router.post(
  "/",
  auth,
  [
    body("name").notEmpty().withMessage("Baby name is required"),
    body("dob").isISO8601().withMessage("Valid date of birth required"),
    body("gender").isIn(["male", "female", "other"]).withMessage("Invalid gender")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const baby = new Baby({
        name: req.body.name,
        dob: req.body.dob,
        gender: req.body.gender,
        caregiverIds: [req.user.id] // link logged-in caregiver as parent
      });

      await baby.save();
      res.status(201).json(baby);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Fetch all babies for logged-in caregiver (only return names, date of birth and gender)
router.get("/", auth, async (req, res) => {
  try {
    const babies = await Baby.find(
      { caregiverIds: req.user.id },
      "name dob gender"
    );
    res.json(babies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch specific baby by ID, logged in user must be a caregiver
router.get("/:babyId/", auth,[param("babyId").isMongoId()],handleValidationErrors, async(req,res)=>{
      try {
        const baby = await Baby.findById(req.params.babyId);
        if (!baby) return res.status(404).json({ message: "Baby not found" });
  
        // Only caregivers of this baby can fetch this baby info
        if (!baby.caregiverIds.includes(req.user.id))
          return res.status(403).json({ message: "Access denied" });
  
        res.json(baby);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
})

module.exports = router;
