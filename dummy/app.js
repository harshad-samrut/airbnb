const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();

app.use(
  session({
    secret: "samiksha",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(flash());

app.get("/test", (req, res) => {
  console.dir(req.session.cookie["path"]);
  res.send("understanding the sessions");
});

app.get("/flash", (req, res) => {
  req.flash("success", "user reg succefully");
  res.redirect("/flash/it");
});

app.get("/flash/it", (req, res) => {
  let msg = req.flash("success");
  console.log(msg);
  res.send("wtf");
});
app.listen(8080, () => {
  console.log("app is listining....");
});
