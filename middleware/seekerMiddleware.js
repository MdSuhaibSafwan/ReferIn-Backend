const { Seeker } = require("../models/seeker");

exports.seekerMiddleware = async function seekerMiddleware(req, res, next) {
  try {
    var userId = req.user.id;
    const seekerFetchedData = await Seeker.findByUserId(userId);

    if (seekerFetchedData.error) {
      return res
        .status(500)
        .json({ message: "Database error", error: seekerFetchedData.error });
    }
    if (!seekerFetchedData.data || seekerFetchedData.data.length == 0) {
      return res.status(403).json({ message: "User is not a seeker" });
    }

    req.seeker = seekerFetchedData.data[0];
    next();
  } catch (error) {
    console.error("Error in seekerMiddleware:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
