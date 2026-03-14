import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateUserId from "../utils/generateUserId.js";

export const signup = async (req, res) => {
try {

const { name, email, password } = req.body;

const userId = generateUserId();

const userExists = await User.findOne({ email });

if (userExists) {
    return res.status(400).json({ message: "User already exists" });
}

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

const user = await User.create({
    name,
    email,
    password: hashedPassword,
    userId
});

res.status(201).json(user);

} catch (error) {
res.status(500).json({ error: error.message });
}
};

export const login = async (req, res) => {
try {

const { email, password } = req.body;

const user = await User.findOne({ email });

if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
}

const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
}

const token = jwt.sign(
{ id: user._id },
process.env.JWT_SECRET,
{ expiresIn: "7d" }
);

res.json({ token, user });

} catch (error) {
res.status(500).json({ error: error.message });
}
};