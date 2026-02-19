require("dotenv").config();
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require("../generated/prisma/client");

// Use 127.0.0.1 instead of localhost - often fixes Windows MySQL connection
const host = process.env.DATABASE_HOST || "localhost";
const dbHost = host === "localhost" ? "127.0.0.1" : host;

const adapter = new PrismaMariaDb({
  host: dbHost,
  port: parseInt(process.env.DATABASE_PORT || "3306", 10),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  connectTimeout: 8000,
  logger: {
    error: (err) => console.error("[DB Error]", err),
    warning: (info) => console.warn("[DB Warning]", info),
  },
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
