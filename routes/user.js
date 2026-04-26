const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controller/user.js");

// In practice:

// For auth routes, many developers prefer simple routes:

// router.get("/signup", userController.renderSignUpForm);
// router.post("/signup", wrapAsync(userController.signingUp));

// Because:

// Signup & login are not REST resources
// They are actions, not data endpoints

router
  .route("/signup")
  .get(userController.renderSignUpForm)
  .post(wrapAsync(userController.signingUp));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    userController.loggingIn,
  );

router.post("/logout", userController.logOut);

module.exports = router;
