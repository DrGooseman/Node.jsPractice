const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

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
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  res.status(status).json({ message });
});

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then((result) => {
    const server = app.listen(8080, () =>
      console.log("Server running on port 8080")
    );
    const io = require("socket.io")(server);
    io.on("connection", (socket) => {
      console.log("client connected");
    });
  })
  .catch((err) => console.log(err));
