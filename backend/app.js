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

const api = process.env.API_URL;
//Routes
const appContentRoutes = require("./routes/appContents");
app.use(`${api}/app-content`, appContentRoutes);

const blogRoutes = require("./routes/blogPosts");
app.use(`${api}/blogs`, blogRoutes);

const categoriesRoutes = require("./routes/categories");
app.use(`${api}/categories`, categoriesRoutes);

const brandRoutes = require("./routes/brands");
app.use(`${api}/brands`, brandRoutes);

const productsRoutes = require("./routes/products");
app.use(`${api}/products`, productsRoutes);

const usersRoutes = require("./routes/users");
app.use(`${api}/users`, usersRoutes);

const ordersRoutes = require("./routes/orders");
app.use(`${api}/orders`, ordersRoutes);

const payoutsRoutes = require("./routes/payouts");
app.use(`${api}/payouts`, payoutsRoutes);

const biddingOfferRoutes = require("./routes/biddingOffers");
app.use(`${api}/bidding`, biddingOfferRoutes);

const sellingRoutes = require("./routes/sellingItems");
app.use(`${api}/selling`, sellingRoutes);

const attributeRoutes = require("./routes/attributes");
app.use(`${api}/attributes`, attributeRoutes);

const attributeOptionsRoutes = require("./routes/attributeOptions");
app.use(`${api}/attribute-options`, attributeOptionsRoutes);

const shippingRoutes = require("./routes/shippings");
app.use(`${api}/shippings`, shippingRoutes);

const homeFeedSectionRoutes = require("./routes/homeFeedSectionRoutes");
app.use(`${api}/home-feed-sections`, homeFeedSectionRoutes);

const tiersRoutes = require("./routes/tiersRoutes");
app.use(`${api}/tiers`, tiersRoutes);

const soleCheckBrandsRoutes = require("./routes/soleCheckBrands");
app.use(`${api}/sole-check-brands`, soleCheckBrandsRoutes);

const soleCheckModelsRoutes = require("./routes/soleCheckModels");
app.use(`${api}/sole-check-models`, soleCheckModelsRoutes);

const soleCheckItemsRoutes = require("./routes/soleCheckItems");
app.use(`${api}/sole-check-items`, soleCheckItemsRoutes);

const portfolioItemsRoutes = require("./routes/portfolioItems");
app.use(`${api}/portfolio`, portfolioItemsRoutes);

const wishlistRoutes = require("./routes/wishlists");
app.use(`${api}/wishlist`, wishlistRoutes);

const soleDrawRoutes = require("./routes/soleDraws");
app.use(`${api}/draws`, soleDrawRoutes);

const calenderNotifiesRoutes = require("./routes/calenderNotifies");
app.use(`${api}/user-calender-notifications`, calenderNotifiesRoutes);

const drawAttendsRoutes = require("./routes/drawAttends");
app.use(`${api}/draw-joins`, drawAttendsRoutes);

const expoPushTokens = require("./routes/expoPushTokens");
app.use(`${api}/expoPushTokens`, expoPushTokens);

const subBrandRoutes = require("./routes/subBrandRoutes");
app.use(`${api}/sub-brands`, subBrandRoutes);

const subCategoryRoutes = require("./routes/subCategoryRoutes");
app.use(`${api}/sub-categories`, subCategoryRoutes);

const indicatorRoutes = require("./routes/indicatorRoutes");
app.use(`${api}/indicators`, indicatorRoutes);

const feedButtonRoutes = require("./routes/feedButtonRoutes");
app.use(`${api}/home-feed-buttons`, feedButtonRoutes);

const trendsRoutes = require("./routes/trends");
app.use(`${api}/trends`, trendsRoutes);

const deleteFileRoutes = require("./routes/deleteFile");
const posterRoutes = require("./routes/posterRoutes");

const tierBenefitRoutes = require("./routes/tierBenefitRoutes");
app.use(`${api}/tier-benefits`, tierBenefitRoutes);

const soleCheckSettingsRoutes = require("./routes/soleCheckSettings");
app.use(`${api}/sole-check`, soleCheckSettingsRoutes);

const voucherRoutes = require("./routes/voucherRoutes");
app.use(`${api}/vouchers`, voucherRoutes);

const voucherSectionRoutes = require("./routes/voucherSection");
app.use(`${api}/voucher-sections`, voucherSectionRoutes);

const logRoutes = require("./routes/log");
app.use(`${api}/logs`, logRoutes);

const activityRoutes = require("./routes/activityRoutes");
app.use(`${api}/activities`, activityRoutes);

const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
app.use(`${api}/payment-methods`, paymentMethodRoutes);

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
