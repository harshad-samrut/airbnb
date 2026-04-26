const express = require("express");
const router = express.Router(); // renamed to router (standard)
const flash = require("connect-flash");
const { isLoggedIn, isOwner } = require("../middleware.js");

const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const listingController = require("../controller/listing.js");

const { storage } = require("../cloudconfig.js");
const multer = require("multer");
const upload = multer({ storage });

// Improved Validation Middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

router.use(flash());

// Listings (GET all, POST new)
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );

// New form
router.get("/new",isLoggedIn, listingController.renderNewForm);

// Single listing (show, update, delete)
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
