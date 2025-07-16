const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/chatbotController");

console.log("chatbotRoutes loaded, registering route: /");
router.post("/", chatWithAI);

module.exports = router;