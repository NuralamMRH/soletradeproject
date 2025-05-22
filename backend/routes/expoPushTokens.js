const express = require("express");
const { ExpoPush } = require("../models/expoPush");
const router = express.Router();
const {
  updateExpoPushToken,
  getExpoPushToken,
} = require("../controllers/expoPushTokenController");

router.get(`/`, async (req, res) => {
  const expoPushList = await ExpoPush.find();

  if (!expoPushList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(expoPushList);
});

router.get("/:id", getExpoPushToken);

router.post("/", async (req, res) => {
  let expoPush = new ExpoPush({
    expoPushToken: req.body.expoPushToken,
  });
  expoPush = await expoPush.save();

  if (!expoPush) return res.status(400).send("the expoPush cannot be created!");

  res.send(expoPush);
});

router.put("/:id", updateExpoPushToken);

router.delete("/:id", async (req, res) => {
  try {
    const expoPush = await ExpoPush.findOneAndDelete({ _id: req.params.id });

    if (expoPush) {
      return res
        .status(200)
        .json({ success: true, message: "The expoPushToken is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "ExpoPushToken not found!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
