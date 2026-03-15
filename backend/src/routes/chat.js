const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { chatUpload } = require("../middleware/upload");
const {
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

router.get("/conversations", authenticate, getConversations);
router.get("/conversations/:id/messages", authenticate, getMessages);
router.post("/send", authenticate, chatUpload.array("files", 5), sendMessage);

module.exports = router;
