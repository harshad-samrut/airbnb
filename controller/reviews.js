const Listing = require("../models/listing");
const Review = require("../models/Reviews");

module.exports.addReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found!");

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  await newReview.save();

  listing.reviews.push(newReview);
  await listing.save();
  await listing.populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  });

  req.flash("success", "review added");

  res.redirect(`/listings/${req.params.id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewid } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findByIdAndDelete(reviewid);
  req.flash("success", "Review deleted");
  res.redirect(`/listings/${id}`);
};
