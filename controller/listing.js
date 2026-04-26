const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListing = await Listing.find();
  res.render("./listing/index.ejs", { data: allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listing/new.ejs", { currUser: req.user });
};

module.exports.createListing = async (req, res) => {
  const { price } = req.body.listing;
  if (!price || isNaN(price)) {
    throw new ExpressError(400, "Price must be a valid number");
  }

  let newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // ✅ handle image safely
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();

  req.flash("success", "Villa added Successfully");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.showListing = async (req, res) => {
  const villa = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  // console.log(villa);
  if (!villa) {
    req.flash("error", "Villa does not exists");
    return res.redirect("/listings");
  }
  res.render("./listing/show.ejs", { villa });
};

module.exports.renderEditForm = async (req, res) => {
  const data = await Listing.findById(req.params.id);
  // if (!data) throw new ExpressError(404, "Listing not found!");
  if (!data) {
    req.flash("error", "Villa does not exists");
    return res.redirect("/listings");
  }
  let originalUrl = data.image.url;
  originalUrl = originalUrl.replace("/upload", "/upload/w_250");
  res.render("./listing/edit.ejs", { data, originalUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let updateData = { ...req.body.listing };

  // ✅ add image directly in same update
  if (req.file) {
    updateData.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await Listing.findByIdAndUpdate(id, updateData);

  req.flash("success", "Details Edited Successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Villa deleted successfully");
  res.redirect("/listings");
};
