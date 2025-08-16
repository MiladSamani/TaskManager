import "dotenv/config";
import DB from "./db.js";

console.log(DB.getTaskByTitle("learn docker"));

