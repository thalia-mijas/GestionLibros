const express = require("express");
const app = express();
const booksRouter = require("./routes/books");
const sequelize = require("./models"); // Importa la instancia de Sequelize

app.use(express.json());
app.use("/books", booksRouter);

sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Unable to synchronize the database:", error);
  });
