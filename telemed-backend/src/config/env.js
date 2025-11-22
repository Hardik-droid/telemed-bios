// src/config/env.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  db: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;