class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.model = query.model;
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
        "lowestPriceFilter",
      ];
      removeFields.forEach((el) => delete queryCopy[el]);

      // Multi-select filter support
      // Convert string to array if comma-separated, or keep as array
      const multiFields = [
        { key: "subCategoryIds", dbField: "subCategoryId" },
        { key: "brandIds", dbField: "brandId" },
        { key: "subBrandIds", dbField: "subBrandId" },
        { key: "indicatorIds", dbField: "indicatorId" },
        { key: "serviceTypes", dbField: "serviceType" },
      ];
      multiFields.forEach(({ key, dbField }) => {
        if (queryCopy[key]) {
          let val = queryCopy[key];
          if (typeof val === "string") {
            // Check for comma-separated string
            if (val.includes(",")) {
              val = val.split(",").map((v) => v.trim());
            } else {
              val = [val];
            }
          }
          if (Array.isArray(val)) {
            queryCopy[dbField] = { $in: val };
          } else {
            queryCopy[dbField] = val;
          }
          delete queryCopy[key];
        }
      });

      // Colors filter (colorway or mainColor)
      if (queryCopy.colors) {
        let colors = queryCopy.colors;
        if (typeof colors === "string") {
          colors = colors.split(",").map((v) => v.trim());
        }
        if (Array.isArray(colors)) {
          queryCopy.$or = [
            { colorway: { $in: colors } },
            { mainColor: { $in: colors } },
          ];
        }
        delete queryCopy.colors;
      }

      // Variations filter (variationIds)
      if (
        queryCopy.variationIds &&
        typeof queryCopy.variationIds === "object"
      ) {
        // Each key is an attributeId, value is an array of attributeOptionIds
        const variationFilters = Object.values(queryCopy.variationIds)
          .filter((arr) => Array.isArray(arr) && arr.length > 0)
          .map((optionIds) => ({ $elemMatch: { $in: optionIds } }));
        if (variationFilters.length > 0) {
          queryCopy.variations = { $all: variationFilters };
        }
        delete queryCopy.variationIds;
      }

      // Advanced filter
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      );

      // If price filter is present, use aggregation to filter by lowestAsk or retailPrice
      if (
        this.queryStr.lowestPriceFilter &&
        Array.isArray(this.queryStr.lowestPriceFilter) &&
        this.queryStr.lowestPriceFilter.length === 2
      ) {
        const [minPriceRaw, maxPriceRaw] = this.queryStr.lowestPriceFilter;
        const minPrice = Number(minPriceRaw);
        const maxPrice = Number(maxPriceRaw);

        // Build additional match stages for numViews, sellerFee, buyerFee
        const extraMatch = {};
        if (this.queryStr.numViews) {
          if (
            Array.isArray(this.queryStr.numViews) &&
            this.queryStr.numViews.length === 2
          ) {
            extraMatch.numViews = {
              $gte: Number(this.queryStr.numViews[0]),
              $lte: Number(this.queryStr.numViews[1]),
            };
          } else {
            extraMatch.numViews = Number(this.queryStr.numViews);
          }
        }
        if (this.queryStr.sellerFee) {
          if (
            Array.isArray(this.queryStr.sellerFee) &&
            this.queryStr.sellerFee.length === 2
          ) {
            extraMatch.sellerFee = {
              $gte: Number(this.queryStr.sellerFee[0]),
              $lte: Number(this.queryStr.sellerFee[1]),
            };
          } else {
            extraMatch.sellerFee = Number(this.queryStr.sellerFee);
          }
        }
        if (this.queryStr.buyerFee) {
          if (
            Array.isArray(this.queryStr.buyerFee) &&
            this.queryStr.buyerFee.length === 2
          ) {
            extraMatch.buyerFee = {
              $gte: Number(this.queryStr.buyerFee[0]),
              $lte: Number(this.queryStr.buyerFee[1]),
            };
          } else {
            extraMatch.buyerFee = Number(this.queryStr.buyerFee);
          }
        }

        this.query = this.model.aggregate([
          { $match: { ...JSON.parse(queryStr), ...extraMatch } },
          {
            $lookup: {
              from: "sellingoffers",
              let: { productId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$productId", "$$productId"] },
                        { $eq: ["$status", "Active"] },
                        { $eq: ["$type", "placeAsk"] },
                      ],
                    },
                  },
                },
                { $sort: { sellingPrice: 1, sellingAt: 1 } },
                { $limit: 1 },
              ],
              as: "lowestAskArr",
            },
          },
          {
            $addFields: {
              lowestAskPrice: {
                $ifNull: [
                  { $arrayElemAt: ["$lowestAskArr.sellingPrice", 0] },
                  "$retailPrice",
                ],
              },
            },
          },
          {
            $match: {
              lowestAskPrice: { $gte: minPrice, $lte: maxPrice },
            },
          },
        ]);
        return this;
      }

      // If price filter is not present, allow numViews, sellerFee, buyerFee in .find()
      const rangeFields = ["numViews", "sellerFee", "buyerFee"];
      rangeFields.forEach((field) => {
        if (this.queryStr[field]) {
          if (
            Array.isArray(this.queryStr[field]) &&
            this.queryStr[field].length === 2
          ) {
            queryCopy[field] = {
              $gte: Number(this.queryStr[field][0]),
              $lte: Number(this.queryStr[field][1]),
            };
          } else {
            queryCopy[field] = Number(this.queryStr[field]);
          }
        }
      });

      // Apply base filters
      this.query = this.query.find(JSON.parse(queryStr));

      // Apply special filters (lowestAsk, lowestBid, highestBid, recent_solds)

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
      let allProducts;
      if (typeof this.query.lean === "function") {
        allProducts = await this.query.lean();
      } else if (typeof this.query.exec === "function") {
        allProducts = await this.query.exec();
      } else {
        allProducts = await this.query;
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
