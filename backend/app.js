var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport/index");
const bodyParser = require("body-parser");
const cors = require("cors");

// dotenv
const dotenv = require("dotenv");
dotenv.config();

// routers
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
var authRouter = require("./routes/auth");
var postRouter = require("./routes/post");
const { sequelize } = require("./models");

// init express app
var app = express();

// init sequelize
sequelize
    .sync({ force: true })
    .then(() => {
        console.log("데이터베이스 연결 성공");
    })
    .catch((err) => {
        console.error(err);
    });

// set express-session
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// passport & session
app.use(
    session({
        secret: "secret_key",
        resave: true,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());
passportConfig();

// route handler
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

// listen server
app.listen(app.get("port"), () => {
    console.log(
        app.get("port"),
        "번 포트에서 대기중\n",
        "NODE_ENV: ",
        process.env.NODE_ENV
    );
});

module.exports = app;