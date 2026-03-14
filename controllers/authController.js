import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateUserId from "../utils/generateUserId.js";

export const signup = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // generate unique userId
        let userId;
        let exists = true;

        while (exists) {

            userId = generateUserId();

            const user = await User.findOne({ userId });

            if (!user) exists = false;

        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            userId
        });

        res.status(201).json({
            userId: user.userId,
            name: user.name,
            email: user.email
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: error.message
        });

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

    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};