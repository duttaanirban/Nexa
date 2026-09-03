require("dotenv").config();

const app = require("./app");
const { testDatabaseConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to connect to PostgreSQL:",
      error.message
    );

    process.exit(1);
  }
};

startServer();