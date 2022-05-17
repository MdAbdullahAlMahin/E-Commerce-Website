var express = require("express");
const { default: monk } = require("monk");
var router = express.Router();

/**
 * This function queries a list of products whose name contains the search string from DB.
 *
 * @param
 */
function getProductsFromDB(db, category_string, search_string) {
  // query the DB for the list of products
  // we do not need the comments here so we use projection to drop them
  // we also sort the returned news entries by their time field so latest
  // news will appear first in the result
  return db.get("productCollection").find(
    {
      category: category_string,
      headline: { $regex: search_string, $options: "i" },
    },
    {
      projection: { category: 0, manufacturer: 0, description: 0 },
    }
  );
}
function getProductInfoFromDB(db, id_string) {
  // query the DB for the list of products
  // we do not need the comments here so we use projection to drop them
  // we also sort the returned news entries by their time field so latest
  // news will appear first in the result
  return db.get("productCollection").find(
    {
      _id: id_string,
    },
    {
      projection: { _id: 0, name: 0, category: 0, price: 0, productImage: 0 },
    }
  );
}
/**
 * This function queries a user document from the DB using username.
 *
 * @param db the database object
 * @param {String} username username
 * @return a Promise holding the resulting documents
 */
function queryUserByNameFromDB(db, username) {
  return db.get("userCollection").find({
    username: username,
  });
}
/**
 * This function queries a user document from the DB using username.
 *
 * @param db the database object
 * @param {String} userID the ID of the user to query
 * @return a Promise holding the resulting documents
 */
function queryUserByIDFromDB(db, userID) {
  return db.get("userCollection").find({
    _id: monk.id(userID),
  });
}
/**
 * Utility function to send a plain text response.
 *
 * @param res the response object in express.js
 * @param {String} text the text to send
 */
function sendPlainText(res, text) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(text);
}
/**
 * Utility function to send a unified format JSON string.
 *
 * @param res the response object in express.js
 * @param {String} status the status of the database operations
 * @param {Array<ObjectId>} productIds the array of productIds
 * @param {Array<String>} names the array of product names
 * @param {Array<Number>} prices the array of product prices
 * @param {Array>String>} images the array of image paths
 * @param {String} msg the message to send
 */
function sendPageLoadJSON(res, status, productIDs, names, prices, images, msg) {
  var res_json = {
    status: status,
    _id: productIDs,
    name: names,
    price: prices,
    productImage: images,
    message: msg,
  };

  res.json(res_json);
}
/**
 * Utility function to send a unified format JSON string.
 *
 * @param res the response object in express.js
 * @param {String} status the status of the database operations
 * @param {Array<productId>} productIds the array of productIds
 * @param {Array<quantity>} quantities the array of quantities of products
 * @param {Number} totalnum the total quantity of products in the cart
 * @param {Array<Product>} productInfo the array of products' info
 * @param {String} msg the message to send
 */
function sendCartLoadJSON(
  res,
  status,
  productIds,
  quantities,
  totalnum,
  productInfo,
  msg
) {
  var res_json = {
    status: status,
    productId: productIds,
    quantity: quantities,
    totalnum: totalnum,
    productInfo: productInfo,
    message: msg,
  };

  res.json(res_json);
}
/**
 * Utility function to send a unified format JSON string.
 *
 * @param res the response object in express.js
 * @param {String} status the status of the database operations
 * @param {String} manufacturer the manufacturer of the product
 * @param {String} description the description of the product
 * @param {String} msg the message to send
 */
function sendProductLoadJSON(res, status, manufacturer, description, msg) {
  res_json = {
    status: status,
    manufacturer: manufacturer,
    description: description,
    message: msg,
  };

  res.json(res_json);
}
/**
 * Utility function to send a unified format JSON string.
 *
 * @param res the response object in express.js
 * @param {String} status the status of the operations
 * @param {String} text the text to send
 */
function sendLoginJSON(res, status, text) {
  var res_json = {
    status: status,
    message: text,
  };

  res.json(res_json);
}
/**
 * Utility function to send a unified format JSON string.
 *
 * @param res the response object in express.js
 * @param {String} cookieStatus whether or not the userID cookie is set
 * @param {String} dbStatus the status of the database operations
 * @param {String} info the message to send
 */
function sendSessionInfoJSON(res, cookieStatus, dbStatus, info) {
  var res_json = {
    cookieStatus: cookieStatus,
    dbStatus: dbStatus,
    message: info,
  };

  res.json(res_json);
}
/**
 * This function modifies the cart of the specified user.
 *
 * @param  db the database object
 * @param {String} userID the userID String to query
 * @param {String} productID the productId of the product
 * @param {Number} productQuantity the quantity of the product
 * @param {String} status the String to indicate ADD or UPDATE
 * @returns a Promise which resolves when the update is done
 */
function addOrUpdateProductDB(db, userID, productID, productQuantity, type) {
  if (type == "ADD") {
    return db.get("userCollection").update(
      { _id: monk.id(userID) },
      {
        $push: {
          cart: {
            productId: monk.id(productID),
            quantity: productQuantity,
          },
        },
      }
    );
  } else if (type == "UPDATE") {
    return db.get("userCollection").update(
      { _id: monk.id(userID), "cart.productId": monk.id(productID) },
      {
        $inc: {
          "cart.$.quantity": productQuantity,
          totalnum: productQuantity,
        },
      }
    );
  }
}
/**
 *
 * @param db the database object
 * @param {*} userID the ID of the user to query
 * @returns a Promise holding the resulting document
 */
function queryUserEntryFromDB(db, userID) {
  // Here we perform an aggregation:
  //  Stage 1: we match the user using userID
  //  Stage 2: we perform a look up from productCollection.
  //           For each entry in cart, we try to find documents in productCollection whose _id
  //           field (foreignField: '_id') matches the cart product's productId(localField: 'cart.productId')
  //           The retrieved documents in userList are put in a new field called "comment_users".
  //           We further run a projection on the joined collection, dropping the user's username and password, and the product's description.
  //           This is done by specifying the "pipeline" field of the lookup.
  //
  //  Schema of returned document:
  //    {
  //      _id: ObjectId,
  //      totalnum: Number,
  //      cart: Array<Information>
  //          Information: {
  //            productId: ObjectId,
  //            quantity: Number,
  //          }
  //      cart_products: Array<Product>
  //          Products: {
  //            _id: ObjectId
  //            name: String,
  //            price: Number,
  //            productImage: String,
  //          }
  //    }

  return db.get("userCollection").aggregate([
    { $match: { _id: monk.id(userID) } },
    {
      $lookup: {
        from: "productCollection",
        localField: "cart.productId",
        foreignField: "_id",
        as: "cart_products",
        pipeline: [
          {
            $project: {
              username: 0,
              password: 0,
              description: 0,
            },
          },
        ],
      },
    },
  ]);
}
/**
 * This function updates the cart of a user.
 *
 * @param  db the database object
 * @param {String} userID the userID String to query
 * @param {String} productID the productId of the product
 * @param {Number} productQuantity the quantity of the product
 * @param {String} totalQuantity the resulting total quantity after deleting
 * @returns a Promise which resolves when the update is done
 */
function updateProductQuantityDB(
  db,
  userID,
  productID,
  productQuantity,
  totalQuantity
) {
  return db.get("userCollection").update(
    { _id: monk.id(userID), "cart.productId": monk.id(productID) },
    {
      $set: {
        "cart.$.quantity": productQuantity,
        totalnum: totalQuantity,
      },
    }
  );
}
/**
 * This function deletes a product from the specified user's cart.
 *
 * @param db the database object
 * @param {String} userID the ID of the user to update
 * @param {String} productID the ID of the product to delete
 * @param {String} totalQuantity the resulting total quantity after deleting
 * @returns a Promise which resolves when the update is done
 */
function deleteProductDB(db, userID, productID, totalQuantity) {
  return db.get("userCollection").update(
    { _id: monk.id(userID) },
    {
      $pull: { cart: { productId: monk.id(productID) } },
      $set: { totalnum: totalQuantity },
    }
  );
}
/**
 * This function empties the cart of the specified user.
 *
 * @param db the database object
 * @param {String} userID the userID String to query
 * @returns a Promise which resolves when the update is done
 */
function emptyCartDB(db, userID) {
  return db.get("userCollection").update(
    { _id: monk.id(userID) },
    {
      $set: { cart: [], totalnum: 0 },
    }
  );
}

// handle GET request for http://localhost:3001/loadpage
router.get("http://localhost:3001/loadpage", (req, res) => {
  var category = req.params.category;
  var searchstring = req.params.searchstring;
  getProductsFromDB(req.db, category, searchstring)
    .then((db_docs) => {
      // construct and send the response in json
      var _ids = new Array();
      var names = new Array();
      var prices = new Array();
      var productImages = new Array();

      for (let i = 0; i < db_docs.length; i++) {
        var doc = db_docs[i];
        _ids.push(doc._id);
        names.push(doc.name);
        prices.push(doc.price);
        productImages.push(doc.productImage);
      }

      sendPageLoadJSON(
        res,
        "SUCCESSFUL",
        _ids,
        names,
        prices,
        productImages,
        ""
      );
    })
    .catch((err) => {
      sendPageLoadJSON(res, "UNSUCCESSFUL", [], [], [], [], err.message);
    });
});

// handle GET request for http://localhost:3001/loadproduct/:productid
router.get("http://localhost:3001/loadproduct/:productid", (req, res) => {
  var productID = req.params.productid;

  getProductInfoFromDB(req.db, productID)
    .then((db_doc) => {
      sendProductLoadJSON(
        res,
        "SUCCESSFUL",
        db_doc.manufacturer,
        db_doc.description,
        ""
      );
    })
    .catch((err) => {
      sendProductLoadJSON(res, "UNSUCCESSFUL", "", "", err.message);
    });
});

// handle POST request for http://localhost:3001/signin
router.post("http://localhost:3001/signin", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  queryUserByNameFromDB(req.db, username)
    .then((db_doc) => {
      if (db_doc.length == 0) {
        // unable to find a matching document
        sendLoginJSON(res, "SUCCESSFUL", "Login failure.");
        return;
      }
      var user_entry = db_doc[0];
      if (user_entry.password != password) {
        sendLoginJSON(res, "SUCCESSFUL", "Login failure.");
      } else {
        // set the userID cookie
        res.cookie("userID", user_entry._id);

        // retrieve total number of items in the cart of user
        total_num = user_entry.totalnum;
        sendLoginJSON(res, "SUCCESSFUL", total_num.toString());
      }
    })
    .catch((err) => {
      sendLoginJSON(res, "UNSUCCESSFUL", err.message);
    });
});

// handle GET request for http://localhost:3001/signout
router.get("http://localhost:3001/signout", (req, res) => {
  if (req.cookies.userID) {
    // clear cookie
    res.clearCookie("userID");
    sendPlainText(res, "");
  } else {
    sendPlainText(res, "");
  }
});

// handle GET request for http://localhost:3001/getsessioninfo
router.get("http://localhost:3001/getsessioninfo", (req, res) => {
  if (req.cookies.userID) {
    queryUserByIDFromDB(req.db, req.cookies.userID)
      .then((db_doc) => {
        sendSessionInfoJSON(res, "SET", "SUCCESSFUL", {
          username: db_doc.username,
          totalnum: db_doc.totalnum,
        });
      })
      .catch((err) => {
        sendSessionInfoJSON(res, "SET", "UNSUCCESSFUL", err.message);
      });
  } else {
    sendSessionInfoJSON(res, "NOT SET", "", "");
  }
});

// handle PUT request for http://localhost:3001/addtocart
router.put("http://localhost:3001/addtocart", (req, res) => {
  var productID = req.body.productID;
  var productQuantity = req.body.quantity;
  var db = req.db;
  var userID = req.cookes.userID;

  queryUserByIDFromDB(db, userID).then((db_doc) => {
    return new Promise((resolve, reject) => {
      var addOrUpdate = "ADD";

      for (let i = 0; i < db_doc.cart.length; i++) {
        var cart = db_doc.cart[i];

        if (cart.productId.equals(monk.id(productID))) {
          addOrUpdate = "UPDATE";
          break;
        }
      }
      resolve(addOrUpdate);
    }).then((status) => {
      addOrUpdateProductDB(db, userID, productID, productQuantity, status)
        .then((_) => {
          queryUserByIDFromDB(db, userID).then((db_doc) => {
            res.json({ message: db_doc.totalnum });
          });
        })
        .catch((err) => {
          res.json({ message: err.message });
        });
    });
  });
});

// handle GET request for http://localhost:3001/loadcart
router.get("http://localhost:3001/loadcart", (req, res) => {
  queryUserEntryFromDB(req.db, req.cookies.userID)
    .then((db_doc) => {
      var productIds = new Array();
      var quantities = new Array();

      for (let i = 0; i < db_doc.cart.length; i++) {
        var cart = db_doc.cart[i];
        productIds.push(cart.productId);
        quantities.push(cart.quantity);
      }

      sendCartLoadJSON(
        res,
        "SUCCESSFUL",
        productIds,
        quantities,
        db_doc.totalnum,
        db_doc.cart_products,
        ""
      );
    })
    .catch((err) => {
      sendCartLoadJSON(res, "UNSUCCESSFUL", [], [], 0, [], err.message);
    });
});

// handle PUT request for http://localhost:3001/updatecart
router.put("http://localhost:3001/updatecart", (req, res) => {
  var productID = req.body.productId;
  var productQuantity = req.body.quantity;
  var db = req.db;
  var userID = req.cookies.userID;

  queryUserByIDFromDB(db, userID).then((db_doc) => {
    return new Promise((resolve, reject) => {
      var quantity_array = new Array();
      quantity_array.push(productQuantity);

      for (let i = 0; i < db_doc.cart.length; i++) {
        var cart = db_doc.cart[i];

        if (cart.productId.equals(monk.id(productID))) {
          var totalQuantityIncrement = productQuantity - cart.quantity;
          break;
        }
      }

      var totalQuantity = db_doc.totalnum + totalQuantityIncrement;
      quantity_array.push(totalQuantity);

      resolve(quantity_array);
    }).then((quantity_array) => {
      updateProductQuantityDB(
        db,
        userID,
        productID,
        quantity_array[0],
        quantity_array[1]
      )
        .then((_) => {
          sendPlainText(res, quantity_array[1]);
        })
        .catch((err) => {
          sendPlainText(res, err.message);
        });
    });
  });
});

// handle DELETE request for http://localhost:3001/deletefromcart/:productid
router.delete("http://localhost:3001/deletefromcart/:productid", (req, res) => {
  var productID = req.params.productid;
  var db = req.db;
  var userID = req.cookies.userID;

  queryUserByIDFromDB(db, userID).then((db_doc) => {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < db_doc.cart.length; i++) {
        var cart = db_doc.cart[i];

        if (cart.productId.equals(monk.id(productID))) {
          var productQuantity = cart.quantity;
          break;
        }
      }

      var totalQuantity = db_doc.totalnum - productQuantity;

      resolve(totalQuantity);
    }).then((totalQuantity) => {
      deleteProductDB(db, userID, productID, totalQuantity)
        .then((_) => {
          sendPlainText(res, totalQuantity);
        })
        .catch((err) => {
          sendPlainText(res, err.message);
        });
    });
  });
});

// handle GET request for http://localhost:3001/checkout
router.get("http://localhost:3001/checkout", (req, res) => {
  var userID = req.cookies.userID;

  emptyCartDB(req.db, req.cookies.userID)
    .then((_) => {
      sendPlainText(res, "");
    })
    .catch((err) => {
      sendPlainText(res, err.message);
    });
});

module.exports = router;
