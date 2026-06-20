const express = require("express");
const { chatWithAI } = require("../controllers/chatbotController");

const router = express.Router();

router.post("/", chatWithAI);

module.exports = router;