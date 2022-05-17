var conn = new Mongo();

var db = conn.getDB("assignment2");

var products = [
  {
    name: "iPhone 13",
    category: "Phones",
    price: "8000",
    manufacturer: "Apple Inc",
    productImage: "images/iphone13.jpg",
    description: "Most advanced dual-camera system ever.",
  },
  {
    name: "iPad Air",
    category: "Tablets",
    price: "6500",
    manufacturer: "Apple Inc",
    productImage: "images/ipadair.jpg",
    description: "Most advanced processor in a tablet.",
  },
  {
    name: "Macbook Pro",
    category: "Laptops",
    price: "10250",
    manufacturer: "Apple Inc",
    productImage: "images/macbookpro.jpg",
    description: "M1 Chip included.",
  },
  {
    name: "Samsung Galaxy S22",
    category: "Phones",
    price: "7500",
    manufacturer: "Samsung Inc",
    productImage: "images/samsungs22.jpg",
    description: "'Were as good as Apple.'",
  },
  {
    name: "Nokia 1100",
    category: "Phones",
    price: "500",
    manufacturer: "Nokia Inc",
    productImage: "images/nokia1100.jpg",
    description: "Why am I here?",
  },
  {
    name: "Microsoft Surface Pro 7",
    category: "Tablets",
    price: "5500",
    manufacturer: "Microsoft Inc",
    productImage: "images/microsoftsurface.jpg",
    description: "'Better than its competition' - Bill Gates.",
  },
  {
    name: "ASUS Vivobook Gaming",
    category: "Laptops",
    price: "10250",
    manufacturer: "ASUS Inc",
    productImage: "images/asusvivobook.jpg",
    description: "This is my personal laptop.",
  },
  {
    name: "Razer Blade 14",
    category: "Laptops",
    price: "12500",
    manufacturer: "Razer Inc",
    productImage: "images/razerblade.jpg",
    description: "The premier gaming laptop.",
  },
  {
    name: "iPhone 14",
    category: "Phones",
    price: "8500",
    manufacturer: "Apple Inc",
    productImage: "images/iphone14.jpg",
    description: "It isn't even out yet.",
  },
  {
    name: "Google Pixel 6",
    category: "Phones",
    price: "8500",
    manufacturer: "Alphabet Inc",
    productImage: "images/googlepixel.jpg",
    description: "Made with the custom Tensor Chip.",
  },
  {
    name: "Amazon Fire HD 8 Kids Edition",
    category: "Tablets",
    price: "1050",
    manufacturer: "Amazon Inc",
    productImage: "images/amazonfire.jpg",
    description: "For all the kids out there.",
  },
  {
    name: "Vivo Y50",
    category: "Phones",
    price: "2000",
    manufacturer: "Vivo Inc",
    productImage: "images/vivoy50.jpg",
    description: "This is my phone.",
  },
];

var users = [
  {
    username: "Jack",
    password: "1234",
    cart: [],
    totalnum: 0,
  },
  {
    username: "Alice",
    password: "1234",
    cart: [],
    totalnum: 0,
  },
];

db.productCollection.remove({});
db.userCollection.remove({});

for (let i = 0; i < products.length; i++) {
  db.productCollection.insert({
    name: products[i].name,
    category: products[i].category,
    price: products[i].price,
    manufacturer: products[i].manufacturer,
    productImage: products[i].productImage,
    description: products[i].description,
  });
}
for (let i = 0; i < users.length; i++) {
  db.userCollection.insert({
    username: users[i].username,
    password: users[i].password,
    cart: users[i].cart,
    totalnum: users[i].totalnum,
  });
}
