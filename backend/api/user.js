import bcrypt from "bcryptjs";
import { validationResult, body } from "express-validator";
import Caregiver from "../models/caregiver.js";
import connectDB from "../config/db.js";
import cookie from "cookie";
import auth from "../middleware/auth.js";

const isProd = process.env.NODE_ENV === "production";

// helper: send cookies manually (since no res.cookie in serverless)
function setCookies(res, cookies) {
  const serialized = cookies.map((c) => cookie.serialize(c.name, c.value, c.options));
  res.setHeader("Set-Cookie", serialized);
}

function validateRequest(req, res, validations) {
  for (const v of validations) {
    try {
      v.run(req);
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ errors: result.array() });
    return false;
  }
  return true;
}

async function parseJSONBody(req) {
  if (req.method === "POST" || req.method === "PUT") {
    try {
      return await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => (data += chunk));
        req.on("end", () => {
          if (!data) return resolve({});
          resolve(JSON.parse(data));
        });
        req.on("error", err => reject(err));
      });
    } catch {
      return null;
    }
  }
  return {};
}

export default async function handler(req, res) {
    await connectDB();
    const bodyData = await parseJSONBody(req);
    if (bodyData === null) return res.status(400).json({ message: "Invalid JSON" });

    const user = await auth(req, res);
    if (!user) return;

    const username = user.username;


  if (method === "GET" && req.query.action === "profile") {
    try {
      const caregiver = await Caregiver.findOne({ username }).select(
        "-password -__v"
      );

      if (!caregiver)
        return res.status(404).json({ message: "User not found" });

      return res.status(200).json(caregiver);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
  else if (method === "POST" && req.query.action === "update") {
        const valid = validateRequest(req, res, [
          body("name").notEmpty(),
          body("oldPassword").notEmpty(),
          body("newPassword").notEmpty(),
        ]);
        if (!valid) return;

        const {name, oldpassword, newpassword} = req.body;
        try{
        const caregiver = await Caregiver.findOne({ username });
        if (!caregiver)
        return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(oldpassword, caregiver.password);
        if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

        caregiver.name = name;
        caregiver.password = newpassword;
        await caregiver.save();

      return res.status(200).json({
        message: "Profile updated successfully",
        user: { name: caregiver.name, username: caregiver.username },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "Server error" });

  }
}
}