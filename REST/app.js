const express = require("express");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then((result) => {
    app.listen(8080, () => console.log("Server running on port 8080"));
  })
  .catch((err) => console.log(err));
