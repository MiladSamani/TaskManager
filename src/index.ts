import "dotenv/config";
import DB from "./DB/db.js";

console.log(DB.saveTask(0, "learn nest", true));
