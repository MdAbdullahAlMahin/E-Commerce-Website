import $ from "jquery";
import {
  FaSearch,
  FaBackward,
  FaShoppingCart,
  FaForward,
  FaCheck,
} from "react-icons/fa";
import React from "react";
import "./App.css";

// TODO: fix the searching
// TODO: theres no need to store cart and _id

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "list",
      prev_page: "product",
      prodId: 0,
      added: false,
      paid: false,
      isLoggedIn: false,
      category: "All",
      search_string: "",
      products: [],
      product: {
        description: null,
      },
      user: {
        _id: null,
        username: "",
        cart: [],
        totalnum: 0,
      },
    };
    this.navigate = this.navigate.bind(this);
    this.goBack = this.goBack.bind(this);
    this.findProduct = this.findProduct.bind(this);
    this.addProduct = this.addProduct.bind(this);
    this.resetAdded = this.resetAdded.bind(this);
    this.flipPaid = this.flipPaid.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getProducts = this.getProducts.bind(this);
    this.searchProducts = this.searchProducts.bind(this);
    this.fetchProduct = this.fetchProduct.bind(this);
    this.fetchCart = this.fetchCart.bind(this);
    this.updateCart = this.updateCart.bind(this);
    this.checkOut = this.checkOut.bind(this);
  }
  navigate = (page, prodId) => {
    if (typeof prodId === "undefined") {
      prodId = this.state.prodId;
    }
    if (this.state.page !== page) {
      this.setState({
        prev_page: this.state.page,
        page: page,
        prodId: prodId,
        added: false,
      });
    }
  };
  goBack = () => {
    this.navigate(this.state.prev_page);
  };
  findProduct = () => {
    for (var i = 0; i < this.state.products.length; i++) {
      if (this.state.products[i]._id === this.state.prodId) {
        return this.state.products[i];
      }
    }
    return null;
  };
  addProduct = (quantity, _id) => {
    var user = this.state.user;
    const setData = () => {
      this.setState({ added: true, user: user });
    };
    $.ajax({
      type: "PUT",
      url: "http://localhost:3001/addtocart",
      data: {
        productId: _id,
        quantity: quantity,
      },
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: function (data) {
        if (!data.err) {
          user.totalnum = data.totalnum;
          setData();
        } else {
          alert(data.err_string);
        }
      },
      failure: function () {
        alert("Please try adding the product again...");
      },
    });
  };
  resetAdded = () => {
    this.setState({ added: false });
  };
  flipPaid = () => {
    this.setState({ paid: !this.state.paid });
  };
  checkOut = () => {
    $.ajax({
      type: "GET",
      url: "http://localhost:3001/checkout",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: function (data) {
        if (!data.err) {
          this.flipPaid();
        } else {
          alert(data.err_string);
        }
      },
      failure: function () {
        alert("Please try checking out again...");
      },
    });
  };
  login = (totalnum, username, id) => {
    var user = this.state.user;
    user.username = username;
    user.totalnum = totalnum;
    user._id = id;
    this.setState({
      isLoggedIn: true,
      user: user,
    });
  };
  logout = () => {
    var user = this.state.user;
    var savedname = user.username;
    var savedtotal = user.totalnum;
    var savedid = user._id;
    user.username = "";
    user.totalnum = 0;
    user._id = null;
    if (this.state.page === "cart") {
      var prodId = this.state.prodId;
      this.setState({
        isLoggedIn: false,
        user: user,
        prev_page: this.state.page,
        page: "list",
        prodId: prodId,
      });
    } else {
      this.setState({
        isLoggedIn: false,
        user: user,
      });
    }

    const logback = () => {
      this.login(savedtotal, savedname, savedid);
    };
    $.ajax({
      type: "POST",
      url: "http://localhost:3001/signout",
      xhrFields: { withCredentials: true },
      dataType: "json",
      failure: function () {
        alert("Something went wrong...");
        logback();
      },
    });
  };
  getProducts = () => {
    var products = [];
    var category = this.state.category;
    var user = this.state.user;
    const setData = (session) => {
      if (session !== null) {
        if (!session.err) {
          user.totalnum = session.totalnum;
          user.username = session.username;
          user._id = session._id;
        } else {
          this.logout();
          alert(session.err_string);
        }
      }
      if (session.username !== "") {
        this.setState({ products: products, user: user, isLoggedIn: true });
      } else {
        this.setState({ products: products, user: user, isLoggedIn: false });
      }
    };
    if (category === "All") {
      category = "";
    }
    $.ajax({
      url:
        "http://localhost:3001/loadpage?category=" +
        category +
        "&searchstring=" +
        this.state.search_string,
      type: "GET",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: function (data) {
        products = data;
        $.ajax({
          url: "http://localhost:3001/getsessioninfo",
          type: "GET",
          xhrFields: { withCredentials: true },
          dataType: "json",
          success: function (data) {
            setData(data);
          },
          failure: function () {
            alert("Something went wrong...");
          },
        });
      },
      failure: function () {
        alert("Something went wrong...");
      },
    });
  };
  searchProducts = (category, search_string) => {
    const setProducts = (data) => {
      this.setState({ products: data });
    };
    const navigate = (page, prodId) => {
      if (typeof prodId === "undefined") {
        prodId = this.state.prodId;
      }
      this.setState({ prev_page: this.state.page, page: page, prodId: prodId });
    };
    this.setState({ category: category, search_string: search_string });
    category = category === "All" ? "" : category;

    $.ajax({
      url:
        "http://localhost:3001/loadpage?category=" +
        category +
        "&searchstring=" +
        search_string,
      type: "GET",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: function (data) {
        setProducts(data);
        navigate("list");
      },
    });
  };
  fetchProduct = () => {
    const setProduct = (data) => {
      this.setState({ product: data });
    };
    $.ajax({
      url: "http://localhost:3001/loadproduct/" + this.state.prodId,
      type: "GET",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: function (data) {
        setProduct(data);
      },
    });
  };
  fetchCart = () => {
    var user = this.state.user;
    const setCart = () => {
      this.setState({ user: user });
    };
    $.ajax({
      url: "http://localhost:3001/loadcart",
      type: "GET",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: function (data) {
        if (!data.err) {
          user.cart = data.cart;
          setCart();
        } else {
          alert(data.err_string);
        }
      },
      failure: function () {
        alert("Something went wrong...");
      },
    });
  };
  updateCart = (productId, quantity) => {
    console.log(productId, quantity);
    var user = this.state.user;
    const setData = () => {
      this.setState({ user: user });
    };
    if (parseInt(quantity) === 0) {
      console.log("Delete request");
      $.ajax({
        type: "DELETE",
        url: "http://localhost:3001/deletefromcart/" + productId,
        xhrFields: { withCredentials: true },
        dataType: "json",
        success: function (data) {
          if (!data.err) {
            user.totalnum = data.totalnum;
            setData();
          } else {
            alert(data.err_string);
          }
        },
        failure: function () {
          alert("Please try adding the product again...");
        },
      });
    } else {
      $.ajax({
        type: "PUT",
        url: "http://localhost:3001/updatecart",
        data: {
          productId: productId,
          quantity: quantity,
        },
        xhrFields: { withCredentials: true },
        dataType: "json",
        success: function (data) {
          if (!data.err) {
            user.totalnum = data.totalnum;
            setData();
          } else {
            alert(data.err_string);
          }
        },
        failure: function () {
          alert("Please try adding the product again...");
        },
      });
    }
  };
  render() {
    var page = this.state.page;
    var product = this.state.product;
    if (product.description === null) {
      product = this.findProduct();
    }
    if (page === "list") {
      return (
        <div className="main">
          <Header
            navigate={this.navigate}
            isLoggedIn={this.state.isLoggedIn}
            logout={this.logout}
            user={this.state.user}
            searchProducts={this.searchProducts}
            category={this.state.category}
            search_string={this.state.search_string}
          />
          <ProductList
            products={this.state.products}
            navigate={this.navigate}
            getProducts={this.getProducts}
          />
        </div>
      );
    } else if (page === "product") {
      return (
        <div className="main">
          <Header
            navigate={this.navigate}
            isLoggedIn={this.state.isLoggedIn}
            logout={this.logout}
            user={this.state.user}
            searchProducts={this.searchProducts}
            category={this.state.category}
            search_string={this.state.search_string}
          />
          <ProductPage
            product={product}
            prodId={this.state.prodId}
            navigate={this.navigate}
            addProduct={this.addProduct}
            resetAdded={this.resetAdded}
            added={this.state.added}
            fetchProduct={this.fetchProduct}
            isLoggedIn={this.state.isLoggedIn}
          />
        </div>
      );
    } else if (page === "login") {
      return (
        <div className="main">
          <Login goBack={this.goBack} login={this.login} />
        </div>
      );
    } else if (page === "cart" && this.state.isLoggedIn === true) {
      return (
        <div className="main">
          <Header
            navigate={this.navigate}
            isLoggedIn={this.state.isLoggedIn}
            logout={this.logout}
            user={this.state.user}
            searchProducts={this.searchProducts}
            category={this.state.category}
            search_string={this.state.search_string}
          />
          <Cart
            user={this.state.user}
            flipPaid={this.flipPaid}
            goBack={this.goBack}
            paid={this.state.paid}
            navigate={this.navigate}
            fetchCart={this.fetchCart}
            updateCart={this.updateCart}
            checkOut={this.checkOut}
          />
        </div>
      );
    }
  }
}

function Header(props) {
  var category = props.category;
  var search_string = props.search_string;
  return (
    <div className="header">
      <div
        id="header-title"
        onClick={() => {
          props.navigate("list");
        }}
      >
        <p>
          <span className="unique-color">P</span>hones
          <span className="unique-color">L</span>aptops
          <span className="unique-color">T</span>ablets
          <span className="unique-color">.com</span>
        </p>
      </div>
      <div className="header-searcharea">
        <select
          id="header-searcharea-select"
          onChange={(event) => {
            category = event.target.value;
          }}
        >
          <option value="All">All</option>
          <option value="Phones">Phones</option>
          <option value="Tablets">Tablets</option>
          <option value="Laptops">Laptops</option>
        </select>
        <input
          id="header-searcharea-search"
          onChange={(event) => {
            search_string = event.target.value.trim();
          }}
          defaultValue={search_string}
        />
        <button
          id="button-search"
          onClick={() => {
            props.searchProducts(category, search_string);
          }}
        >
          <FaSearch id="header-icon-search" />
        </button>
      </div>
      {!props.isLoggedIn ? (
        <div className="header-signin">
          <button
            onClick={() => {
              props.navigate("login");
            }}
          >
            Sign In
          </button>
        </div>
      ) : (
        <div className="header-signin">
          <div
            id="header-icon-cart"
            onClick={() => {
              props.navigate("cart");
            }}
          >
            <FaShoppingCart />
          </div>

          <p>
            <span className="unique-color">{props.user.totalnum}</span> in Cart
          </p>
          <div className="header-signin-user">
            <p>
              Hello <span className="unique-color">{props.user.username}</span>!
            </p>
            <button
              onClick={() => {
                props.logout();
              }}
              id="button-signout"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
class ProductList extends React.Component {
  componentDidMount() {
    this.props.getProducts();
  }
  render() {
    return (
      <div className="product-list">
        {this.props.products.map((product) => {
          return (
            <Product
              key={product._id}
              id={product._id}
              navigate={this.props.navigate}
              name={product.name}
              price={product.price}
              image={product.productImage}
            />
          );
        })}
      </div>
    );
  }
}
function Product(props) {
  return (
    <div
      className="product-card"
      onClick={() => {
        props.navigate("product", props.id);
      }}
    >
      <img
        src={"http://localhost:3001/" + props.image}
        alt={props.name}
        height={200}
        width={220}
      />
      <p>{props.name}</p>
      <p>HKD {props.price}</p>
    </div>
  );
}
class ProductPage extends React.Component {
  componentDidMount() {
    this.props.fetchProduct();
  }
  render() {
    var props = this.props;
    var number = 0;
    return (
      <div>
        <div>
          <img
            src={"http://localhost:3001/" + props.product.productImage}
            alt={props.product.name}
          />
          {!this.props.added ? (
            <div>
              <div>
                <p>{props.product.name}</p>
                <p>{props.product.price}</p>
                <p>{props.product.manufacturer}</p>
                <p>{props.product.description}</p>
              </div>
              <div>
                <label htmlFor="number_input">Quantity:</label>
                <input
                  name="number_input"
                  type="number"
                  min="0"
                  onChange={(evt) => {
                    number = evt.target.value;
                  }}
                />
                <button
                  onClick={() => {
                    if (props.isLoggedIn) {
                      if (number > 0) {
                        props.addProduct(number, props.prodId);
                      } else {
                        alert("No quantity selected...");
                      }
                    } else {
                      props.navigate("login");
                    }
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>
                <FaCheck />
                Added to cart
              </p>
            </div>
          )}
        </div>
        <div>
          {!props.added ? (
            <button
              onClick={() => {
                props.navigate("list");
              }}
            >
              <FaBackward />
              Go Back
            </button>
          ) : (
            <button
              onClick={() => {
                props.resetAdded();
                props.navigate("list");
              }}
            >
              Continue Browsing
              <FaForward />
            </button>
          )}
        </div>
      </div>
    );
  }
}
function Login(props) {
  var username = "";
  var password = "";
  const validate = () => {
    $.ajax({
      type: "POST",
      url: "http://localhost:3001/signin",
      data: {
        username: username,
        password: password,
      },
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: function (data) {
        var err = data.err;
        if (!err) {
          var totalnum = data.totalnum;
          var username = data.username;
          var _id = data._id;
          props.login(totalnum, username, _id);
          props.goBack();
        } else {
          alert(data.err_string);
        }
      },
      failure: function () {
        alert("Something went wrong...");
      },
    });
  };
  return (
    <div>
      <div>
        {/* Spinner */}
        <label htmlFor="username">Username</label>
        <input
          name="username"
          type="text"
          onChange={(event) => {
            username = event.target.value;
          }}
        />
        <br />
        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          onChange={(event) => {
            password = event.target.value;
          }}
        />
        <br />
        <button
          onClick={() => {
            if (username === "" || username === null) {
              alert("Username not entered");
            } else if (password === "" || password === null) {
              alert("Password not entered");
            } else {
              validate();
            }
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            props.goBack();
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
class Cart extends React.Component {
  constructor(props) {
    super(props);
    this.totalPrice = this.totalPrice.bind(this);
  }
  componentDidMount() {
    this.props.fetchCart();
  }
  componentDidUpdate(prevProps) {
    console.log(prevProps.user, this.props.user);
    if (this.props.user.totalnum !== prevProps.user.totalnum) {
      this.props.fetchCart();
    }
  }
  totalPrice = () => {
    return this.props.user.cart
      .map((product) => {
        return product.price * product.quantity;
      })
      .reduce((prev, curr) => prev + curr, 0);
  };
  render() {
    var props = this.props;
    return (
      <div>
        {props.paid === false ? (
          <div>
            <p>Shopping Cart</p>
            <div>
              {props.user.cart.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>&nbsp;</th>
                      <th>&nbsp;</th>
                      <th>Price:</th>
                      <th>Quantity:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.user.cart.map((product) => {
                      return (
                        <tr key={product.productId}>
                          <td>
                            <img
                              alt={product.name}
                              src={"http://localhost:3001/" + product.img}
                              height={200}
                              width={200}
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>HKD {product.price}</td>
                          <td>
                            <input
                              type="number"
                              defaultValue={product.quantity}
                              min="0"
                              key={product.quantity}
                              onChange={(evt) => {
                                props.updateCart(
                                  product.productId,
                                  evt.target.value
                                );
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>Your cart is empty...</p>
              )}
            </div>
            {props.user.cart.length > 0 ? (
              <p>
                Cart subtotal ({props.user.totalnum} item(s)):{" "}
                {this.totalPrice()}
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <FaCheck />
            <p>
              You have successfully placed your order for {props.user.totalnum}{" "}
              item(s)
            </p>
            <p>{this.totalPrice()} paid</p>
          </div>
        )}
        {props.paid === false ? (
          <div>
            <button
              onClick={() => {
                props.goBack();
              }}
            >
              Go Back
            </button>
            <button
              onClick={() => {
                props.checkOut();
              }}
            >
              Proceed to check out
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              props.flipPaid();
              props.navigate("list");
            }}
          >
            Continue Browsing
            <FaForward />
          </button>
        )}
      </div>
    );
  }
}

export default App;
