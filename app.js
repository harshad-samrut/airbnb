if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const flash = require("connect-flash");

const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");

const session = require("express-session");

const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
  .then((result) => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "samiksha",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  }),
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash + Current User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ====================== ROUTES ======================
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/user", usersRouter);

// ====================== 404 HANDLER ======================
// This should be AFTER all routes
app.use((req, res, next) => {
  return next(new ExpressError(404, "Page not found"));
});

// ====================== ERROR HANDLER ======================
// This should be the LAST middleware
app.use((err, req, res, next) => {

  let { statusCode = 500 } = err;
  let message = err.message || "Something went wrong";

  console.error(err); // helpful for debugging
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Listining the app");
});
