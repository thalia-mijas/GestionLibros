const { DataTypes } = require("sequelize");
const sequelize = require("./index"); // Importa la instancia de Sequelize

const Book = sequelize.define("books", {
  title: DataTypes.STRING,
  author: DataTypes.STRING,
  genre: DataTypes.STRING,
  published_year: DataTypes.STRING,
});

module.exports = Book;
