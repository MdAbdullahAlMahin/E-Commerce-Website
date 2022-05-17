import $ from "jquery";
import {
  FaSearch,
  FaBackward,
  FaShoppingCart,
  FaForward,
  FaCheck,
} from "react-icons/fa";
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      login: false,
      isLoggedIn: false,
      user: {
        name: "dummy",
        totalnum: 3,
        cart: [
          {
            id: 2,
            name: "dummy",
            price: 20,
            manufacturer: "dummy",
            details: "dummy",
            image: "../../../",
            number: 2,
          },
          {
            id: 3,
            name: "dummy",
            price: 10,
            manufacturer: "dummy",
            details: "dummy",
            image: "../../../",
            number: 3,
          },
        ],
      },
      showCart: false,
    };
    this.displayProduct = this.displayProduct.bind(this);
    this.goBackToProductList = this.goBackToProductList.bind(this);
    this.goBackToProduct = this.goBackToProduct.bind(this);
    this.goBack = this.goBack.bind(this);
    this.setLoginStatus = this.setLoginStatus.bind(this);
    this.login = this.login.bind(this);
    this.showCart = this.showCart.bind(this);
  }
  displayProduct = (id) => {
    this.setState({ id: id });
  };
  goBack = () => {
    if (!!this.state.id) {
      this.goBackToProductList();
    } else {
      this.goBackToProduct();
    }
  };
  goBackToProductList = () => {
    this.setState({ id: null, login: false, showCart: false });
  };
  goBackToProduct = () => {
    this.setState({ login: false, showCart: false });
  };
  setLoginStatus = (bool) => {
    this.setState({ isLoggedIn: bool });
  };
  login = () => {
    this.setState({ login: true });
  };
  showCart = () => {
    this.setState({ showCart: true });
  };
  render() {
    var id = this.state.id;
    var login = this.state.login;
    var showCart = this.state.showCart;
    if (login) {
      console.log("login render");
      return (
        <LoginPage
          goBackToProductList={this.goBackToProductList}
          goBackToProduct={this.goBackToProduct}
          setLoginStatus={this.setLoginStatus}
          id={this.state.id}
        />
      );
    } else {
      console.log("page render");
      return (
        <div>
          <Header
            login={this.login}
            setLoginStatus={this.setLoginStatus}
            showCart={this.showCart}
            isLoggedIn={this.state.isLoggedIn}
            user={this.state.user}
          />

          {!id ? (
            <ProductList displayProduct={this.displayProduct} />
          ) : (
            <Product
              id={this.state.id}
              goBackToProductList={this.goBackToProductList}
              isLoggedIn={this.state.isLoggedIn}
              login={this.login}
            />
          )}
        </div>
      );
    }
  }
}

function Header(props) {
  return (
    <div className="header">
      <p>Website Name</p>
      <select>
        <option value="All">All</option>
        <option value="Phones">Phones</option>
        <option value="Tablets">Tablets</option>
        <option value="Laptops">Laptops</option>
      </select>
      <input />
      <button type="button">
        <FaSearch />
      </button>
      <br />

      {props.isLoggedIn ? (
        <div>
          <div onClick={props.showCart()}>
            <FaShoppingCart />
          </div>
          <p>{props.user.totalnum} in Cart</p>
          <div>
            <p>Hello, {props.user.name}</p>
            <button
              onClick={() => {
                props.setLoginStatus(false);
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              props.login();
            }}
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}

function ProductList(props) {
  return (
    <div>
      <div
        onClick={() => {
          console.log("clicked");
          props.displayProduct(2);
        }}
      >
        <img></img>
        <p>Name</p>
        <p>Price</p>
      </div>
      <div>
        <img></img>
        <p>Name</p>
        <p>Price</p>
      </div>
      <div>
        <img></img>
        <p>Name</p>
        <p>Price</p>
      </div>
      <div>
        <img></img>
        <p>Name</p>
        <p>Price</p>
      </div>
      <div>
        <img></img>
        <p>Name</p>
        <p>Price</p>
      </div>
    </div>
  );
}

class Product extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      added: false,
      product: {
        id: 2,
        name: "dummy",
        price: "0",
        manufacturer: "dummy",
        details: "dummy",
        image: "../../../",
      },
    };
  }
  render() {
    return (
      <div>
        <div>
          <img src="" alt="product image"></img>
          {!this.state.added ? (
            <div>
              <div>
                <p>{this.state.product.name}</p>
                <p>{this.state.product.price}</p>
                <p>{this.state.product.manufacturer}</p>
                <p>{this.state.product.details}</p>
              </div>
              <div>
                <label htmlFor="number_input">Quantity:</label>
                <input name="number_input" type="number" />
                <button
                  onClick={() => {
                    this.props.isLoggedIn
                      ? this.setState({ added: true })
                      : this.props.login();
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
          {!this.state.added ? (
            <button onClick={() => this.props.goBackToProductList()}>
              <FaBackward />
              Go Back
            </button>
          ) : (
            <button onClick={() => this.props.goBackToProductList()}>
              <FaForward />
              Continue Browsing
            </button>
          )}
        </div>
      </div>
    );
  }
}

function LoginPage(props) {
  function validate() {
    // Send Request
    console.log("in validate");
    if (true) {
      console.log("in if true");
      props.setLoginStatus(true);
      console.log("after set login status");
      if (props.id !== null) {
        props.goBackToProduct();
        console.log("id not null");
      } else {
        console.log("id null");
        props.goBackToProductList();
      }
    }
  }
  return (
    <div>
      <div>
        {/* Spinner */}
        <label htmlFor="username">Username</label>
        <input name="username" type="text" />
        <br />
        <label htmlFor="password">Password</label>
        <input name="password" type="text" />
        <br />
        <button
          onClick={() => {
            console.log("clicked");
            validate();
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            if (props.id !== null) {
              props.goBackToProduct();
            } else {
              props.goBackToProductList();
            }
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
    this.state = {
      paid: false,
    };
  }

  render() {
    const totalPrice = () => {
      return this.props.user.cart
        .map((product) => {
          return product.price * product.number;
        })
        .reduce((prev, curr) => prev + curr, 0);
    };
    return (
      <div>
        {!this.state.paid ? (
          <div>
            <p>Shopping Cart</p>
            <div>
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
                  {this.props.user.cart.map((product, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <img></img>
                        </td>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>
                          <input type="number" defaultValue={product.number} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p>
              Cart subtotal ({this.props.user.totalnum} item(s)): {totalPrice()}
            </p>
          </div>
        ) : (
          <div>
            <FaCheck />
            <p>
              You have successfully placed your order for{" "}
              {this.props.user.totalnum} item(s)
            </p>
            <p>{totalPrice()} paid</p>
          </div>
        )}

        {!this.state.paid ? (
          <button
            onClick={() => {
              this.setState({ paid: true });
            }}
          >
            Proceed to check out
          </button>
        ) : (
          <button onClick={() => this.props.goBack()}>
            <FaForward />
            Continue Browsing
          </button>
        )}
      </div>
    );
  }
}

export default App;
