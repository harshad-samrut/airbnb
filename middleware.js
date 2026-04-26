const Listing = require("./models/listing");
const Reviews = require("./models/Reviews");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log(req.headers);
    // console.log(req.path);
    // console.log(req.url);
    // console.log(req.originalUrl);
    // console.log(req.headers.referer);
    let redirectUrl =
      req.method === "GET" ? req.originalUrl : req.get("Referer"); //OR req.headers.referer;

    req.session.redirectUrl = redirectUrl || "/listings";

    req.flash("error", "Please logged in");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let user = await Listing.findById(id);

  if (!user) {
     req.flash("error", "User not found");
    return res.redirect("/listings");
  }

  if (!user.owner.equals(res.locals.currUser._id)) {
     req.flash("error", "You are not the owner");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
  let { reviewid , id} = req.params;
  let user = await Reviews.findById(reviewid);
  if(!user.author.equals(res.locals.currUser._id)){
    req.flash('error',"you are not the owner of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
}