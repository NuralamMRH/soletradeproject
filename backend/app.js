const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
// const errorMiddleware = require("./utils/errorHandler");
const errorMiddleware = require("./middlewares/errors");

require("dotenv").config();

const path = require("path");

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files first, before other middleware
app.use(
  "/public/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);

//middleware

app.use(cookieParser());
// app.use(morgan("tiny"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
const appContentRoutes = require("./routes/appContents");
const blogRoutes = require("./routes/blogPosts");
const categoriesRoutes = require("./routes/categories");
const brandRoutes = require("./routes/brands");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const payoutsRoutes = require("./routes/payouts");
const biddingOfferRoutes = require("./routes/biddingOffers");
const sellingRoutes = require("./routes/sellingItems");
const attributeRoutes = require("./routes/attributes");
const attributeOptionsRoutes = require("./routes/attributeOptions");
const shippingRoutes = require("./routes/shippings");
const homeFeedSectionRoutes = require("./routes/homeFeedSectionRoutes");
const tiersRoutes = require("./routes/tiersRoutes");

const soleCheckBrandsRoutes = require("./routes/soleCheckBrands");
const soleCheckModelsRoutes = require("./routes/soleCheckModels");
const soleCheckItemsRoutes = require("./routes/soleCheckItems");

const portfolioItemsRoutes = require("./routes/portfolioItems");
const wishlistRoutes = require("./routes/wishlists");
const soleDrawRoutes = require("./routes/soleDraws");
const calenderNotifiesRoutes = require("./routes/calenderNotifies");
const drawAttendsRoutes = require("./routes/drawAttends");
const expoPushTokens = require("./routes/expoPushTokens");

const subBrandRoutes = require("./routes/subBrandRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const indicatorRoutes = require("./routes/indicatorRoutes");
const feedButtonRoutes = require("./routes/feedButtonRoutes");
const deleteFileRoutes = require("./routes/deleteFile");
const trendsRoutes = require("./routes/trends");
const posterRoutes = require("./routes/posterRoutes");

const tierBenefitRoutes = require("./routes/tierBenefitRoutes");
const soleCheckSettingsRoutes = require("./routes/soleCheckSettings");
const voucherRoutes = require("./routes/voucherRoutes");

const api = process.env.API_URL;

app.use(`${api}/app-content`, appContentRoutes);
app.use(`${api}/blogs`, blogRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/brands`, brandRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/payouts`, payoutsRoutes);
app.use(`${api}/bidding`, biddingOfferRoutes);
app.use(`${api}/selling`, sellingRoutes);
app.use(`${api}/attributes`, attributeRoutes);
app.use(`${api}/attribute-options`, attributeOptionsRoutes);
app.use(`${api}/shippings`, shippingRoutes);
app.use(`${api}/home-feed-sections`, homeFeedSectionRoutes);
app.use(`${api}/tiers`, tiersRoutes);

app.use(`${api}/sole-check-brands`, soleCheckBrandsRoutes);
app.use(`${api}/sole-check-models`, soleCheckModelsRoutes);
app.use(`${api}/sole-check-items`, soleCheckItemsRoutes);

app.use(`${api}/portfolio`, portfolioItemsRoutes);

app.use(`${api}/wishlist`, wishlistRoutes);

app.use(`${api}/draws`, soleDrawRoutes);
app.use(`${api}/user-calender-notifications`, calenderNotifiesRoutes);
app.use(`${api}/draw-joins`, drawAttendsRoutes);

app.use(`${api}/expoPushTokens`, expoPushTokens);

app.use("/api/v1/sub-brands", subBrandRoutes);
app.use("/api/v1/sub-categories", subCategoryRoutes);
app.use("/api/v1/indicators", indicatorRoutes);
app.use("/api/v1/home-feed-buttons", feedButtonRoutes);
app.use("/api/v1/trends", trendsRoutes);

app.use("/api/v1/delete-file", deleteFileRoutes);
app.use("/api/v1/posters", posterRoutes);

app.use("/api/v1/tier-benefits", tierBenefitRoutes);

app.use("/api/v1/sole-check", soleCheckSettingsRoutes);
app.use("/api/v1/vouchers", voucherRoutes);

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
