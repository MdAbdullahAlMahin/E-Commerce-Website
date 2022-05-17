var express = require("express");
var router = express.Router();

router.get("/loadpage", (req, res, next) => {
  var db = req.db;
  var productCollection = db.get("productCollection");
  var category = req.query.category;
  // var category = "";
  var search_string = req.query.searchstring;
  // var search_string = "";
  productCollection
    .find({
      category: { $regex: category },
      name: { $regex: search_string, $options: "i" },
    })
    .then((products) => {
      products.forEach((product) => {
        delete product.category;
        delete product.description;
      });
      products.sort((a, b) =>
        a.name.toLowerCase() > b.name.toLowerCase()
          ? 1
          : b.name.toLowerCase() > a.name.toLowerCase()
          ? -1
          : 0
      );
      res.send(JSON.stringify(products));
    })
    .catch((err) => {
      res.send(JSON.stringify([{ err: true, err_string: err }]));
    });
});
router.get("/loadproduct/:productid", (req, res, next) => {
  var db = req.db;
  var productCollection = db.get("productCollection");
  var id = req.params.productid;

  productCollection
    .find({
      _id: id,
    })
    .then((products) => {
      var product = products[0];
      res.send(JSON.stringify(product));
    })
    .catch((err) => {
      res.send(JSON.stringify([{ err: true, err_string: err }]));
    });
});
router.post("/signin", (req, res, next) => {
  var db = req.db;
  var username = req.body.username;
  var password = req.body.password;
  var userCollection = db.get("userCollection");
  userCollection
    .find({
      username: username,
      password: password,
    })
    .then((users) => {
      if (users.length > 0) {
        var user = users[0];
        res.cookie("userId", user._id);
        res.send(
          JSON.stringify({
            err: false,
            totalnum: user.totalnum,
            username: user.username,
            _id: user._id,
          })
        );
      } else {
        res.send(
          JSON.stringify({
            err: true,
            err_string: "Login Failure, check your username and password",
          })
        );
      }
    })
    .catch((err) => {
      res.send(JSON.stringify([{ err: true, err_string: err }]));
    });
});
router.post("/signout", (req, res, next) => {
  res.clearCookie("userId");
  res.send("");
});
router.get("/getsessioninfo", (req, res, next) => {
  var db = req.db;
  var userCollection = db.get("userCollection");
  var userId = req.cookies.userId;
  console.log(userId);
  if (typeof userId !== "undefined" && userId !== null) {
    userCollection
      .find({
        _id: userId,
      })
      .then((users) => {
        if (users.length > 0) {
          var user = users[0];
          res.send(
            JSON.stringify({
              err: false,
              totalnum: user.totalnum,
              username: user.username,
              _id: user._id,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              err: true,
              err_string: "You were logged out, please sign in again.",
            })
          );
        }
      })
      .catch((err) => {
        res.send(JSON.stringify([{ err: true, err_string: err }]));
      });
  } else {
    res.send(
      JSON.stringify({
        err: false,
        totalnum: 0,
        username: "",
      })
    );
  }
});
router.put("/addtocart", (req, res, next) => {
  var db = req.db;
  var userCollection = db.get("userCollection");
  var userId = req.cookies.userId;
  var productId = req.body.productId;
  var quantity = req.body.quantity;
  if (userId !== null && typeof userId !== undefined) {
    userCollection
      .find({
        _id: userId,
      })
      .then((users) => {
        var user = users[0];
        var added = false;
        user.cart.forEach((item) => {
          if (item.productId === productId) {
            item.quantity = parseInt(item.quantity) + parseInt(quantity);
            added = true;
          }
        });
        if (!added) {
          user.cart.push({ productId: productId, quantity: quantity });
        }
        user.totalnum = parseInt(user.totalnum) + parseInt(quantity);
        userCollection
          .update(
            { _id: userId },
            { $set: { cart: user.cart, totalnum: user.totalnum } }
          )
          .then(() => {
            res.send(JSON.stringify({ err: false, totalnum: user.totalnum }));
          })
          .catch((err) => {
            res.send(
              JSON.stringify({
                err: true,
                err_string: err,
              })
            );
          });
      })
      .catch((err) => {
        res.send(
          JSON.stringify({
            err: true,
            err_string: err,
          })
        );
      });
  } else {
    res.send(
      JSON.stringify({
        err: true,
        err_string: "Unable to add to cart. Please try logging in again...",
      })
    );
  }
});
router.get("/loadcart", (req, res, next) => {
  var db = req.db;
  var userCollection = db.get("userCollection");
  var productCollection = db.get("productCollection");
  var userId = req.cookies.userId;
  if (userId !== null && typeof userId !== undefined) {
    userCollection
      .find({
        _id: userId,
      })
      .then((users) => {
        var user = users[0];
        var ids = [];
        user.cart.forEach((item) => {
          ids.push(item.productId);
        });
        productCollection
          .find({ _id: { $in: ids } })
          .then((products) => {
            if (products.length > 0) {
              for (var j = 0; j < user.cart.length; j++) {
                for (var i = 0; i < products.length; i++) {
                  if (products[i]._id.toString() === user.cart[j].productId) {
                    console.log(i, j);
                    user.cart[j].name = products[i].name;
                    user.cart[j].price = products[i].price;
                    user.cart[j].img = products[i].productImage;
                  }
                }
              }
              user.cart.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
              );
              res.send(JSON.stringify({ err: false, cart: user.cart }));
            } else {
              res.send(
                JSON.stringify({
                  err: false,
                  cart: [],
                })
              );
            }
          })
          .catch((err) => {
            res.send(
              JSON.stringify({
                err: true,
                err_string: err,
              })
            );
          });
      })
      .catch((err) => {
        res.send(
          JSON.stringify({
            err: true,
            err_string: err,
          })
        );
      });
  } else {
    res.send(
      JSON.stringify({
        err: true,
        err_string: "Unable to find to cart. Please try logging in again...",
      })
    );
  }
});
router.put("/updatecart", (req, res, next) => {
  var db = req.db;
  var userCollection = db.get("userCollection");
  var userId = req.cookies.userId;
  var productId = req.body.productId;
  var quantity = req.body.quantity;
  var oldquantity = 0;
  if (userId !== null && typeof userId !== undefined) {
    userCollection
      .find({
        _id: userId,
      })
      .then((users) => {
        var user = users[0];
        user.cart.forEach((item) => {
          if (item.productId === productId) {
            oldquantity = item.quantity;
            item.quantity = parseInt(quantity);
          }
        });
        user.totalnum =
          parseInt(user.totalnum) - parseInt(oldquantity) + parseInt(quantity);
        userCollection
          .update(
            { _id: userId },
            { $set: { cart: user.cart, totalnum: user.totalnum } }
          )
          .then(() => {
            res.send(JSON.stringify({ err: false, totalnum: user.totalnum }));
          })
          .catch((err) => {
            res.send(
              JSON.stringify({
                err: true,
                err_string: err,
              })
            );
          });
      })
      .catch((err) => {
        res.send(
          JSON.stringify({
            err: true,
            err_string: err,
          })
        );
      });
  } else {
    res.send(
      JSON.stringify({
        err: true,
        err_string: "Unable to add to cart. Please try logging in again...",
      })
    );
  }
});
router.delete("/deletefromcart/:productid", (req, res, next) => {
  var db = req.db;
  var userCollection = db.get("userCollection");
  var userId = req.cookies.userId;
  var id = req.params.productid;
  if (userId !== null && typeof userId !== undefined) {
    userCollection
      .find({
        _id: userId,
      })
      .then((users) => {
        var user = users[0];
        var index = 0;
        for (var i = 0; i < user.cart.length; i++) {
          if (user.cart[i].productId.toString() === id) {
            index = i;
          }
        }
        user.totalnum =
          parseInt(user.totalnum) - parseInt(user.cart[index].quantity);
        user.cart.splice(index, 1);
        userCollection
          .update(
            { _id: userId },
            { $set: { cart: user.cart, totalnum: user.totalnum } }
          )
          .then(() => {
            res.send(JSON.stringify({ err: false, totalnum: user.totalnum }));
          })
          .catch((err) => {
            res.send(
              JSON.stringify({
                err: true,
                err_string: err,
              })
            );
          });
      })
      .catch((err) => {
        res.send(
          JSON.stringify({
            err: true,
            err_string: err,
          })
        );
      });
  } else {
    res.send(
      JSON.stringify({
        err: true,
        err_string: "Unable to add to cart. Please try logging in again...",
      })
    );
  }
});
router.get("/checkout", (req, res, next) => {
  var db = req.db;
  var userCollection = db.get("userCollection");
  var userId = req.cookies.userId;
  userCollection
    .update({ _id: userId }, { $set: { cart: [], totalnum: 0 } })
    .then(() => {
      res.send(JSON.stringify({ err: false }));
    })
    .catch((err) => {
      res.send(JSON.stringify({ err: true, err_string: err }));
    });
});
module.exports = router;
