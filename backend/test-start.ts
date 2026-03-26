import dotenv from "dotenv";
dotenv.config();
console.log("Dotenv loaded");

import redis from "./config/redis";
console.log("Redis imported, status:", redis.status);

import "./services/openaiService";
console.log("OpenAI Service imported");

import app from "./server";
console.log("Server app imported");

process.exit(0);
