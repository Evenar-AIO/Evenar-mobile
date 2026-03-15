const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const { supportUpload } = require("../middleware/upload");
const {
  submitSupport,
  listSupport,
} = require("../controllers/supportController");

router.post(
  "/submit",
  authenticate,
  authorize("customer", "event_owner"),
  supportUpload.array("files", 5),
  submitSupport,
);
router.get(
  "/list",
  authenticate,
  authorize("customer", "event_owner", "admin"),
  listSupport,
);

module.exports = router;
