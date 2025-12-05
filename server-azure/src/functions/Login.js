const { app } = require("@azure/functions");
const connectDB = require("../../config/db");
const User = require("../../models/User");
const jwt = require("jsonwebtoken"); 

app.http("Login", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log("Processing Login...");

    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return { status: 400, body: "Invalid JSON" };
    }

    const { email, password } = body;

    if (!email || !password) {
      return { status: 400, body: "Please provide email and password" };
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { status: 400, body: "Invalid credentials" };
      }

      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return { status: 400, body: "Invalid credentials" };
      }

      return {
        status: 200,
        jsonBody: {
          message: "Login Successful",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      };
    } catch (error) {
      context.log.error(error);
      return { status: 500, body: "Server Error" };
    }
  },
});