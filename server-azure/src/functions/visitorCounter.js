const { app } = require("@azure/functions");
const { MongoClient } = require("mongodb");

const uri = process.env.COSMOS_CONNECTION_STR;
let client;

app.http("visitorCounter", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log("Visitor counter triggered");

    try {
      if (!client) {
        client = new MongoClient(uri);
        await client.connect();
      }

      const database = client.db("visitors-data");
      const collection = database.collection("visitors");   

      const updatedItem = await collection.findOneAndUpdate(
        { id: "site_stats" },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: "after" }
      );

      const currentCount = updatedItem.value
        ? updatedItem.value.count
        : updatedItem.count;

      return { body: JSON.stringify({ count: currentCount }) };
    } catch (error) {
      context.log(error);
      return { status: 500, body: "Internal Server Error" };
    }
  },
});
