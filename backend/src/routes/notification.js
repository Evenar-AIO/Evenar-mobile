const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

router.get("/", authenticate, getNotifications);
router.patch(
  "/all/read",
  authenticate,
  (req, res, next) => {
    req.params.id = "all";
    next();
  },
  markAsRead,
);
router.patch("/:id/read", authenticate, markAsRead);

module.exports = router;
