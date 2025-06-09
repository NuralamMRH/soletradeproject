const { SellingItem } = require("../models/sellingOffer");
const { BiddingOffer } = require("../models/biddingOffer");
const { Order } = require("../models/order");
const mongoose = require("mongoose");

class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.specialFilters = {
      lowestBid: null,
      highestBid: null,
      lowestAsk: null,
      highestAsk: null,
      recentSales: null,
      lowestSale: null,
      highestSale: null,
    };
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            { name: { $regex: this.queryStr.keyword, $options: "i" } },
            {
              rich_description: {
                $regex: this.queryStr.keyword,
                $options: "i",
              },
            },
            { description: { $regex: this.queryStr.keyword, $options: "i" } },
          ],
        }
      : {};

    if (this.queryStr.keyword && !isNaN(this.queryStr.keyword)) {
      keyword.$or.push({ birth_year: this.queryStr.keyword });
    }

    this.query = this.query.find({ ...keyword });
    return this;
  }

  async filter() {
    try {
      const queryCopy = { ...this.queryStr };
      const removeFields = [
        "keyword",
        "page",
        "limit",
        "resPerPage",
        "lowestBid",
        "highestBid",
        "lowestAsk",
        "highestAsk",
        "recentSales",
        "lowestSale",
        "highestSale",
      ];
      removeFields.forEach((el) => delete queryCopy[el]);

      // Advanced filter
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      );

      // Apply base filters
      this.query = this.query.find(JSON.parse(queryStr));

      // Apply special filters (lowestAsk, lowestBid, highestBid, recent_solds)
      if (this.queryStr.lowestBid) {
        const lowestBids = await BiddingOffer.aggregate([
          {
            $match: {
              biddingStatus: "Active",
              biddingType: "Offer",
              $or: [{ validUntil: { $gt: new Date() } }, { validUntil: null }],
            },
          },
          {
            $sort: {
              offeredPrice: 1,
              offerCreateDate: 1,
            },
          },
          {
            $group: {
              _id: "$productId",
              lowestBid: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              lowestBid: {
                offeredPrice: "$lowestBid.offeredPrice",
                totalPrice: "$lowestBid.totalPrice",
                offerCreateDate: "$lowestBid.offerCreateDate",
                validUntil: "$lowestBid.validUntil",
              },
            },
          },
        ]);

        const productIds = lowestBids.map(
          (bid) => new mongoose.Types.ObjectId(bid._id)
        );
        this.query = this.query.where("_id").in(productIds);
        this.specialFilters.lowestBid = lowestBids;
      }

      if (this.queryStr.highestBid) {
        const highestBids = await BiddingOffer.aggregate([
          {
            $match: {
              biddingStatus: "Active",
              biddingType: "Offer",
              $or: [{ validUntil: { $gt: new Date() } }, { validUntil: null }],
            },
          },
          {
            $sort: {
              offeredPrice: -1,
              offerCreateDate: 1,
            },
          },
          {
            $group: {
              _id: "$productId",
              highestBid: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              highestBid: {
                offeredPrice: "$highestBid.offeredPrice",
                totalPrice: "$highestBid.totalPrice",
                offerCreateDate: "$highestBid.offerCreateDate",
                validUntil: "$highestBid.validUntil",
              },
            },
          },
        ]);

        const productIds = highestBids.map(
          (bid) => new mongoose.Types.ObjectId(bid._id)
        );
        this.query = this.query.where("_id").in(productIds);
        this.specialFilters.highestBid = highestBids;
      }

      if (this.queryStr.lowestAsk) {
        const lowestAsks = await SellingItem.aggregate([
          {
            $match: {
              status: "Pending",
              sellingType: "Ask",
              $or: [{ validUntil: { $gt: new Date() } }, { validUntil: null }],
            },
          },
          {
            $sort: {
              sellingPrice: 1,
              sellingAt: 1,
            },
          },
          {
            $group: {
              _id: "$productId",
              lowestAsk: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              lowestAsk: {
                offeredPrice: "$lowestAsk.sellingPrice",
                totalPrice: "$lowestAsk.earnings",
                offerCreateDate: "$lowestAsk.sellingAt",
                validUntil: "$lowestAsk.validUntil",
              },
            },
          },
        ]);

        const productIds = lowestAsks.map(
          (ask) => new mongoose.Types.ObjectId(ask._id)
        );
        this.query = this.query.where("_id").in(productIds);
        this.specialFilters.lowestAsk = lowestAsks;
      }

      if (this.queryStr.highestAsk) {
        const highestAsks = await SellingItem.aggregate([
          {
            $match: {
              status: "Pending",
              sellingType: "Ask",
              $or: [{ validUntil: { $gt: new Date() } }, { validUntil: null }],
            },
          },
          {
            $sort: {
              sellingPrice: -1,
              sellingAt: 1,
            },
          },
          {
            $group: {
              _id: "$productId",
              highestAsk: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              highestAsk: {
                offeredPrice: "$highestAsk.sellingPrice",
                totalPrice: "$highestAsk.earnings",
                offerCreateDate: "$highestAsk.sellingAt",
                validUntil: "$highestAsk.validUntil",
              },
            },
          },
        ]);

        const productIds = highestAsks.map(
          (ask) => new mongoose.Types.ObjectId(ask._id)
        );
        this.query = this.query.where("_id").in(productIds);
        this.specialFilters.highestAsk = highestAsks;
      }

      if (this.queryStr.recentSales) {
        const recentSales = await Order.aggregate([
          {
            $match: {
              orderStatus: this.queryStr.orderStatus || "Sold",
              orderType: this.queryStr.orderType || { $exists: true },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $group: {
              _id: "$productId",
              lastSale: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              lastSale: {
                orderType: "$lastSale.orderType",
                orderStatus: "$lastSale.orderStatus",
                totalPrice: "$lastSale.totalPrice",
                offerPrice: "$lastSale.offerPrice",
                sellerOffer: "$lastSale.sellerOffer",
                createdAt: "$lastSale.createdAt",
              },
            },
          },
        ]);

        const productIds = recentSales.map(
          (sale) => new mongoose.Types.ObjectId(sale._id)
        );
        this.query = this.query.where("_id").in(productIds);
        this.specialFilters.recentSales = recentSales;
      }

      if (this.queryStr.lowestSale) {
        const lowestSales = await Order.aggregate([
          {
            $match: {
              orderStatus: this.queryStr.orderStatus || "Sold",
              orderType: this.queryStr.orderType || { $exists: true },
            },
          },
          {
            $sort: { totalPrice: 1, createdAt: 1 },
          },
          {
            $group: {
              _id: "$productId",
              lowestSale: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              lowestSale: {
                orderType: "$lowestSale.orderType",
                orderStatus: "$lowestSale.orderStatus",
                totalPrice: "$lowestSale.totalPrice",
                offerPrice: "$lowestSale.offerPrice",
                sellerOffer: "$lowestSale.sellerOffer",
                createdAt: "$lowestSale.createdAt",
              },
            },
          },
        ]);

        const productIds = lowestSales.map(
          (sale) => new mongoose.Types.ObjectId(sale._id)
        );
        this.query = this.query.where("_id").in(productIds);
        this.specialFilters.lowestSale = lowestSales;
      }

      if (this.queryStr.highestSale) {
        const highestSales = await Order.aggregate([
          {
            $match: {
              orderStatus: this.queryStr.orderStatus || "Sold",
              orderType: this.queryStr.orderType || { $exists: true },
            },
          },
          {
            $sort: { totalPrice: -1, createdAt: 1 },
          },
          {
            $group: {
              _id: "$productId",
              highestSale: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              highestSale: {
                orderType: "$highestSale.orderType",
                orderStatus: "$highestSale.orderStatus",
                totalPrice: "$highestSale.totalPrice",
                offerPrice: "$highestSale.offerPrice",
                sellerOffer: "$highestSale.sellerOffer",
                createdAt: "$highestSale.createdAt",
              },
            },
          },
        ]);

        const productIds = highestSales.map(
          (sale) => new mongoose.Types.ObjectId(sale._id)
        );
        this.query = this.query.where("_id").in(productIds);
        this.specialFilters.highestSale = highestSales;
      }

      if (queryCopy.calenderDateTime) {
        queryCopy.calenderDateTime = {
          ...(queryCopy.calenderDateTime.gte && {
            $gte: new Date(queryCopy.calenderDateTime.gte),
          }),
          ...(queryCopy.calenderDateTime.lte && {
            $lte: new Date(queryCopy.calenderDateTime.lte),
          }),
        };
      }

      return this;
    } catch (error) {
      console.error("Filter error:", error);
      throw error;
    }
  }

  async execute() {
    try {
      // Get all products first
      const allProducts = await this.query.lean();

      // Apply special filters data and sort products
      if (this.specialFilters.lowestBid) {
        allProducts.forEach((product) => {
          const bid = this.specialFilters.lowestBid.find(
            (bid) => bid._id.toString() === product._id.toString()
          );
          if (bid) {
            product.lowestBid = bid.lowestBid;
          }
        });

        // Sort products by lowest bid price
        allProducts.sort((a, b) => {
          const priceA = a.lowestBid?.offeredPrice || Infinity;
          const priceB = b.lowestBid?.offeredPrice || Infinity;
          return priceA - priceB;
        });
      }

      if (this.specialFilters.highestBid) {
        allProducts.forEach((product) => {
          const bid = this.specialFilters.highestBid.find(
            (bid) => bid._id.toString() === product._id.toString()
          );
          if (bid) {
            product.highestBid = bid.highestBid;
          }
        });

        // Sort products by highest bid price
        allProducts.sort((a, b) => {
          const priceA = a.highestBid?.offeredPrice || -Infinity;
          const priceB = b.highestBid?.offeredPrice || -Infinity;
          return priceB - priceA;
        });
      }

      if (this.specialFilters.lowestAsk) {
        allProducts.forEach((product) => {
          const ask = this.specialFilters.lowestAsk.find(
            (ask) => ask._id.toString() === product._id.toString()
          );
          if (ask) {
            product.lowestAsk = ask.lowestAsk;
          }
        });

        // Sort products by lowest ask price
        allProducts.sort((a, b) => {
          const priceA = a.lowestAsk?.offeredPrice || Infinity;
          const priceB = b.lowestAsk?.offeredPrice || Infinity;
          return priceA - priceB;
        });
      }

      if (this.specialFilters.highestAsk) {
        allProducts.forEach((product) => {
          const ask = this.specialFilters.highestAsk.find(
            (ask) => ask._id.toString() === product._id.toString()
          );
          if (ask) {
            product.highestAsk = ask.highestAsk;
          }
        });

        // Sort products by highest ask price
        allProducts.sort((a, b) => {
          const priceA = a.highestAsk?.offeredPrice || -Infinity;
          const priceB = b.highestAsk?.offeredPrice || -Infinity;
          return priceB - priceA;
        });
      }

      if (this.specialFilters.recentSales) {
        allProducts.forEach((product) => {
          const sale = this.specialFilters.recentSales.find(
            (sale) => sale._id.toString() === product._id.toString()
          );
          if (sale) {
            product.lastSale = sale.lastSale;
          }
        });

        // Sort products by most recent sale date
        allProducts.sort((a, b) => {
          const dateA = a.lastSale?.createdAt || new Date(0);
          const dateB = b.lastSale?.createdAt || new Date(0);
          return dateB - dateA;
        });
      }

      if (this.specialFilters.lowestSale) {
        allProducts.forEach((product) => {
          const sale = this.specialFilters.lowestSale.find(
            (sale) => sale._id.toString() === product._id.toString()
          );
          if (sale) {
            product.lowestSale = sale.lowestSale;
          }
        });

        // Sort products by lowest sale price
        allProducts.sort((a, b) => {
          const priceA = a.lowestSale?.totalPrice || Infinity;
          const priceB = b.lowestSale?.totalPrice || Infinity;
          return priceA - priceB;
        });
      }

      if (this.specialFilters.highestSale) {
        allProducts.forEach((product) => {
          const sale = this.specialFilters.highestSale.find(
            (sale) => sale._id.toString() === product._id.toString()
          );
          if (sale) {
            product.highestSale = sale.highestSale;
          }
        });

        // Sort products by highest sale price
        allProducts.sort((a, b) => {
          const priceA = a.highestSale?.totalPrice || -Infinity;
          const priceB = b.highestSale?.totalPrice || -Infinity;
          return priceB - priceA;
        });
      }

      // Get total count
      const totalCount = allProducts.length;

      // Apply pagination after sorting
      const resPerPage = this.queryStr.resPerPage
        ? Number(this.queryStr.resPerPage)
        : 100;
      const currentPage = Number(this.queryStr.page) || 1;
      const skip = resPerPage * (currentPage - 1);

      // Get paginated products
      const products = allProducts.slice(skip, skip + resPerPage);

      return {
        data: products,
        filteredCount: totalCount,
        resPerPage,
        currentPage,
        totalPages: Math.ceil(totalCount / resPerPage),
      };
    } catch (error) {
      console.error("Execute error:", error);
      throw error;
    }
  }
}

module.exports = APIFeatures;
