const router = require("express").Router();
const { authenticate, optionalAuth, authorize } = require("../middleware/auth");
const {
  createFeedback,
  getFeedbackByEvent,
} = require("../controllers/feedbackController");

router.post("/", authenticate, authorize("customer"), createFeedback);
router.get("/:eventId", optionalAuth, getFeedbackByEvent);

module.exports = router;
