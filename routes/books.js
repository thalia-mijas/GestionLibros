const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const redisClient = require("../redis");

router.get("/", async (req, res) => {
  const cachedKey = "books:all";
  const cachedData = await redisClient.get(cachedKey);
  if (cachedData) {
    console.log("Cache hit from Redis");
    return res.json(JSON.parse(cachedData));
  }
  console.log("Cache miss, fetching from database");
  const books = await Book.findAll();
  await redisClient.set(cachedKey, JSON.stringify(books), {
    EX: 1800, // Cache for 30 minutes
  });
  res.json(books);
});

router.post("/", async (req, res) => {
  const { title, author, genre, published_year } = req.body;
  await Book.create({ title, author, genre, published_year });
  res
    .status(201)
    .json({ message: "Book created", title, author, genre, published_year });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const cachedKey = `book:${id}`;
  const cachedData = await redisClient.get(cachedKey);
  if (cachedData) {
    console.log("Cache hit from Redis");
    return res.json(JSON.parse(cachedData));
  }
  console.log("Cache miss, fetching from database");
  const book = await Book.findByPk(id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  await redisClient.set(cachedKey, JSON.stringify(book), {
    EX: 1800, // Cache for 30 minutes
  });
  res.json(book);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, genre, published_year } = req.body;
  const book = await Book.findByPk(id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  await book.update({ title, author, genre, published_year });
  await redisClient.del(`book:${id}`); // Invalidate cache
  res.json({ message: "Book updated", title, author, genre, published_year });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByPk(id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  await book.destroy();
  await redisClient.del(`book:${id}`); // Invalidate cache
  res.json({ message: "Book deleted" });
});

module.exports = router;
