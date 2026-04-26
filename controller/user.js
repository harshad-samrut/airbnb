const User = require('../models/user');

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signingUp = async (req, res) => {
  try {
    let { username, email, password } = req.body.signup;

    let newUser = new User({ username, email });
    let registerUser = await User.register(newUser, password);
    req.login(registerUser, (err) => {
      if (err) return next(err);
      req.flash("success", `${username} welcome to wonderlust`);
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/user/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loggingIn = (req, res) => {
  req.flash("success", `hey..! ${req.user.username} good to see you back`);
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "logout duccessfully");
    res.redirect("/listings");
  });
};
