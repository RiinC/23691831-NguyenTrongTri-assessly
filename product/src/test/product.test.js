const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);


describe("Products", () => {
  let app;
  let authToken;

  before(async () => {
    app = new App();
    await Promise.all([app.connectDB(), app.setupMessageBroker()])

    // Authenticate with the auth microservice to get a token
    const authBase = process.env.AUTH_SERVICE_URL || "http://localhost:3000";
    const testUser = {
      username: "testuser",
      password: "testpassword",
    };

    // Thử đăng ký user mới (nếu chưa tồn tại)
    try {
      const registerRes = await chai.request(authBase).post("/register").send(testUser);
      console.log("Registered new user:", registerRes.body);
    } catch (err) {
      console.log("User might already exist, continuing...");
    }

    // Đăng nhập để lấy token
    const authRes = await chai.request(authBase).post("/login").send(testUser);
    console.log("Auth response:", authRes.body);

    authToken = authRes.body.token;
    console.log("Received auth token:", authToken);

    app.start();
  });

  after(async () => {
    await app.disconnectDB();
    app.stop();
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Product 1",
        description: "Description of Product 1",
        price: 10,
      };

      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Product 1",
          price: 10,
          description: "Description of Product 1"
        });

      console.log(res.body);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
      expect(res.body).to.have.property("description", product.description);
      expect(res.body).to.have.property("price", product.price);
    });

    it("should return an error if name is missing", async () => {
      const product = {
        description: "Description of Product 1",
        price: 10.99,
      };
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      console.log(res.body);

      expect(res).to.have.status(400);
    });
  });
});

