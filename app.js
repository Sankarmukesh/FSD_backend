const express = require("express");
// Routers import
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");

const { verifyAccessToken } = require("./helpers/jwt_helpers");

// MiddleWares import
const cors = require("cors");
const morgan = require("morgan");

const app = express();
// MIDDLEWARES setup
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/userDetails", verifyAccessToken, userRouter);


module.exports = app;
