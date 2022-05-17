var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var router = express.Router();
var productsRouter = require("./routes/products");
var monk = require("monk");
var db = monk("127.0.0.1:27017/assignment2");
var cors = require("cors");
var corsOptions = {
  origin: "http://localhost:3001/",
  credentials: true,
};

// allow expressjs to parse json POST request
app.use(express.json());
// use cookieParser to parse cookies
app.use(cookieParser());
// serve static files in "public" directory
app.use(express.static("public"));
// use cors middleware
app.use(cors());
// handle pre-flight requests before registering routers
app.options(corsOptions, cors());
// make all requests for http://localhost:3001/ to be handled by the productsRouter router
app.use("http://localhost:3001/", productsRouter);
// make db accessible to routers
app.use(function (req, res, next) {
  req.db = db;
  next();
});

app.use(express.urlencoded({ extended: false }));

var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Assignment 2 server listening at http://%s:%s", host, port);
});
