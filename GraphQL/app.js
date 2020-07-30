const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
require("dotenv").config();

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/is-auth");

const app = express();

app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(auth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) return err;
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.code || 500;
      return { message, status: code, data };
    },
  })
);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  res.status(status).json({ message });
});

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, { useNewUrlParser: true })
  .then((result) => {
    app.listen(8080, () => console.log("Server running on port 8080"));
  })
  .catch((err) => console.log(err));
