const { app } = require("@azure/functions");
const connectDB = require("../../config/db");
const User = require("../../models/User"); 

app.http("Register", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log("Processing Register...");

    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return { status: 400, body: "Invalid JSON" };
    }

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return { status: 400, body: "Please fill all fields" };
    }

    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return { status: 400, body: "User already exists" };
      }

      const user = await User.create({
        name,
        email,
        password,
      });

      return {
        status: 201,
        jsonBody: {
          message: "User registered successfully",
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
