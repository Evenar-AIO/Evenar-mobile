const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

router.post("/dev-login", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId required" });
    }

    const db = getDB();
    const user = await db
      .collection("users")
      .findOne(
        { legacyId: parseInt(userId) },
        {
          projection: {
            legacyId: 1,
            username: 1,
            email: 1,
            role: 1,
            avatar: 1,
            isLocked: 1,
          },
        },
      );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: `User ${userId} not found` });
    }
    if (user.isLocked) {
      return res
        .status(403)
        .json({ success: false, message: "User account is locked" });
    }

    const token = jwt.sign(
      {
        userId: user.legacyId,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user: {
        userId: user.legacyId,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    console.error("dev-login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/dev-users", async (req, res) => {
  try {
    const db = getDB();
    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            legacyId: 1,
            username: 1,
            email: 1,
            role: 1,
            avatar: 1,
          },
        },
      )
      .sort({ legacyId: 1 })
      .limit(20)
      .toArray();

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
