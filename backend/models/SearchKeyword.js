const mongoose = require("mongoose");

const searchKeywordSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  keyword: {
    type: String,
    required: true,
  },
  totalSearchCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastSearchedAt: {
    type: Date,
    default: Date.now,
  },
});

searchKeywordSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

searchKeywordSchema.set("toJSON", {
  virtuals: true,
});

searchKeywordSchema.index({ userId: 1, keyword: 1 }, { unique: true });
searchKeywordSchema.index({ keyword: 1 });

// Static methods
searchKeywordSchema.statics.recordSearch = async function (userId, keyword) {
  try {
    const result = await this.findOneAndUpdate(
      { userId, keyword: keyword.toLowerCase() },
      {
        $inc: { totalSearchCount: 1 },
        $set: { lastSearchedAt: new Date() },
      },
      { upsert: true, new: true }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

searchKeywordSchema.statics.getGlobalTopSearches = async function (limit = 10) {
  try {
    const result = await this.aggregate([
      {
        $group: {
          _id: "$keyword",
          totalCount: { $sum: "$totalSearchCount" },
          lastSearchedAt: { $max: "$lastSearchedAt" },
        },
      },
      {
        $sort: { totalCount: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          keyword: "$_id",
          totalSearchCount: "$totalCount",
          lastSearchedAt: 1,
        },
      },
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

searchKeywordSchema.statics.getGlobalRecentSearches = async function (
  limit = 10
) {
  try {
    const result = await this.aggregate([
      {
        $group: {
          _id: "$keyword",
          totalCount: { $sum: "$totalSearchCount" },
          lastSearchedAt: { $max: "$lastSearchedAt" },
        },
      },
      {
        $sort: { lastSearchedAt: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          keyword: "$_id",
          totalSearchCount: "$totalCount",
          lastSearchedAt: 1,
        },
      },
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

searchKeywordSchema.statics.getGlobalKeywordCount = async function (keyword) {
  try {
    const result = await this.aggregate([
      {
        $match: {
          keyword: keyword.toLowerCase(),
        },
      },
      {
        $group: {
          _id: "$keyword",
          totalCount: { $sum: "$totalSearchCount" },
          lastSearchedAt: { $max: "$lastSearchedAt" },
        },
      },
      {
        $project: {
          _id: 0,
          keyword: "$_id",
          totalSearchCount: "$totalCount",
          lastSearchedAt: 1,
        },
      },
    ]);
    return (
      result[0] || {
        keyword: keyword.toLowerCase(),
        totalSearchCount: 0,
        lastSearchedAt: null,
      }
    );
  } catch (error) {
    throw error;
  }
};

exports.SearchKeyword = mongoose.model("SearchKeyword", searchKeywordSchema);
