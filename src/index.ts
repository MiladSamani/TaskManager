import "dotenv/config";
import DB from "./DB/db.js";
//import { arrayData, stringData } from "./DB/data/bulk.js";

//console.log(DB.insertBulkData(arrayData));
//console.log(DB.insertBulkData(stringData));


console.log(DB.deleteTaskByID(2));
