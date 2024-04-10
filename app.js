const express = require("express");
// Routers import
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const passport = require('passport')
const cookiesession = require('cookie-session')
const rolerouter = require("./routes/rolesRouter");
const projectrouter = require("./routes/projectRouter");
const userStoryRouter = require("./routes/userStoryRouter");
const userStoryCommentRouter = require("./routes/userStoryComment");
const taskCommentRouter = require("./routes/taskComments");


const TaskRouter = require("./routes/TaskRouter");




const { verifyAccessToken } = require("./helpers/jwt_helpers");

// MiddleWares import
const cors = require("cors");
const morgan = require("morgan");

const app = express();
// MIDDLEWARES setup
app.use(cookiesession({
    name: 'session',
    keys: ['cyberwolve'],
    maxAge: 24*60*60*100
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/userDetails", verifyAccessToken, userRouter);
app.use("/api/projectDetails", verifyAccessToken, projectrouter);
app.use("/api/userStoryDetails", verifyAccessToken, userStoryRouter);
app.use("/api/userStoryCommentDetails", verifyAccessToken, userStoryCommentRouter);
app.use("/api/taskCommentDetails", verifyAccessToken, taskCommentRouter);


app.use("/api/taskdetails", verifyAccessToken, TaskRouter);




app.use("/api/role", rolerouter);




module.exports = app;
