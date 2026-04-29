const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { location } = req.query;
  let allListing;
  if (location) {
    const regex = new RegExp(escapeRegex(location), "i");
    allListing = await Listing.find({ location: regex });
  } else {
    allListing = await Listing.find();
  }
  res.render("./listing/index", {
    data: allListing,
    searchQuery: location || "",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listing/newForm", { currUser: req.user });
};

module.exports.createListing = async (req, res) => {
  let coordinates = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

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

  newListing.geometry = coordinates.body.features[0].geometry;
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
