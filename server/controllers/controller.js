// Importing DB schema
const { User } = require("../config/db.js");

// Authentication related functions
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// BACKEND API CALLS
const getRoot = (req, res) => {
  res.send("Server Backend Running!");
}; 

const registerUser = async (req, res) => {
  try {
    // email and photo have been removed
    const { name, rollNo, role, disability, password } = req.body;
    
    //Check if user already exists
    const existing = await User.findOne({ rollNo });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ name, rollNo, role, disability, password: hashedPassword });

    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    // Looking for user match
    const user = await User.findOne({ rollNo });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Comparing the password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    
    // Creating JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
 
    // Response should be in this format
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        rollNo: user.rollNo
      }
    });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { rollNo } = req.body;
    const user = await User.findOne({ rollNo });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // For now: Just return a temporary code (later we can email it)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    await user.save();

    res.json({ success: true, message: "Reset code generated", code: resetCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { rollNo, resetCode, newPassword } = req.body;
    const user = await User.findOne({ rollNo });

    if (!user || user.resetCode !== resetCode)
      return res.status(400).json({ success: false, message: "Invalid code or user" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = undefined; // clear code
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRoot, registerUser, getAllUsers, loginUser, forgotPassword, resetPassword}; 
