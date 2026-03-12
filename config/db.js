import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;

//Smart Developer Collaboration & Code Review Platform
// Great approach 👍
// If you clearly understand every feature, the project flow and development will become very easy.

// Your project Smart Developer Collaboration & Code Review Platform is basically a community platform for developers where they can share code, review code, and collaborate.

// I will explain each feature in simple language with real examples.

// 1️⃣ Authentication System (Signup & Login)
// What it does

// Allows developers to create an account and log in.

// Why it is needed

// Every developer must have an identity in the platform.

// Example

// User signs up:

// Name: Anurag
// Email: anurag@gmail.com
// Password: ****** 

// Backend will:

// Hash password using bcrypt

// Save user in MongoDB

// Generate JWT token when logging in

// API Example
// POST /api/auth/signup
// POST /api/auth/login
// Result

// User gets:

// JWT Token
// User Profile
// 2️⃣ Developer Profile
// What it does

// Each user has a developer profile page.

// Profile shows
// Name
// Bio
// Skills
// Posted Code Snippets
// Followers
// Following
// Example
// Name: Anurag Nayak
// Bio: MERN Stack Developer
// Skills: React, Node.js, MongoDB
// API Example
// GET /api/users/:id
// 3️⃣ Code Snippet Sharing (Core Feature)

// This is the main feature of your platform.

// What it does

// Developers can post useful code snippets.

// Example snippet:

// Title: React Debounce Hook
// Language: JavaScript
// Code:
// function debounce(fn, delay){
//   let timer;
// }
// Description: Useful for search optimization
// Why this feature is useful

// Developers can:

// Share reusable code

// Learn from others

// Improve coding skills

// API Example
// POST /api/snippets
// GET /api/snippets
// GET /api/snippets/:id
// 4️⃣ Code Review System

// This is the most interesting feature.

// What it does

// Developers can review other developers' code.

// Example review:

// Reviewer: Rahul
// Comment: You should use useCallback here
// Rating: ⭐⭐⭐⭐
// Why this feature is useful

// Developers can:

// Get feedback

// Improve code quality

// Learn better practices

// API Example
// POST /api/reviews
// GET /api/snippets/:id/reviews
// 5️⃣ Like System
// What it does

// Users can like useful code snippets.

// Example:

// 👍 24 Likes
// Why it is useful

// It helps show popular and helpful code.

// API Example
// PATCH /api/snippets/:id/like

// Database example:

// likes: [
//  userId1,
//  userId2
// ]
// 6️⃣ Comment System

// Users can comment on snippets.

// Example:

// User: Priya
// Comment: Very helpful example!
// Purpose

// Discussion between developers

// Suggestions

// Learning from others

// API Example
// POST /api/comments
// GET /api/snippets/:id/comments
// 7️⃣ Follow Developers

// Developers can follow other developers.

// Example:

// Anurag follows Rahul
// Why it is useful

// Users can:

// Track developers they like

// See their latest code snippets

// API Example
// PATCH /api/users/:id/follow

// Database example:

// followers: [userId1, userId2]
// following: [userId3]
// 8️⃣ Search Code Snippets

// Users can search code.

// Example search:

// Search: React Hook

// Result:

// React Debounce Hook
// React Custom Hook Example
// React useEffect Guide
// API Example
// GET /api/snippets?search=react
// 9️⃣ Explore Developers

// Users can discover other developers.

// Example:

// Top Developers
// New Developers
// Most Active Developers
// API Example
// GET /api/users
// 🔟 Code Language Filter

// Users can filter code by language.

// Example:

// JavaScript
// Python
// Java
// C++

// API Example:

// GET /api/snippets?language=javascript
// 🗂 Database Models

// Your project mainly uses 4 collections.

// User
// name
// email
// password
// bio
// skills
// followers
// following
// Snippet
// title
// code
// language
// description
// author
// likes
// Review
// userId
// snippetId
// comment
// rating
// Comment
// userId
// snippetId
// text
// 🖥 Frontend Pages

// Your React app will have pages like:

// Home Page
// Login Page
// Signup Page
// Create Snippet Page
// Snippet Details Page
// Developer Profile Page
// Explore Developers Page
// 🔄 Full Project Flow
// User Signup/Login
//         ↓
// User Profile Created
//         ↓
// User Posts Code Snippet
//         ↓
// Other Developers View Code
//         ↓
// They Like / Comment / Review Code
//         ↓
// Developers Follow Each Other
//         ↓
// Community Learning Platform
// 🎯 Final Goal of This Platform

// Create a developer community where developers:

// Share code

// Learn from others

// Review code

// Collaborate