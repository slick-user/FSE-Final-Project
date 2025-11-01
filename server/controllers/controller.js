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
    const { name, email, rollNo, Photo, role, disability, password } = req.body;
    
    //Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ name, email, rollNo, Photo, role, disability, password: hashedPassword });

    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Looking for user match
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Comparing the password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    
    // Creating JWT Token
    const token = jwt.sign({ id: user_id, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
  
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo
      }
    });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
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

module.exports = { getRoot, registerUser, getAllUsers, loginUser }; 
