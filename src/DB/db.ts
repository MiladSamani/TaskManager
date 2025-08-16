import fs from "fs";
import chalk from "chalk";
import { Task } from "../types/task.js";

const filename: string | undefined = process.env.DB_FILE;
if (!filename) {
  throw new Error("DB_FILE is not defined in environment variables.");
}

const warning = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

export default class DB {
  /** Creates a new database file if it does not already exist */
  static createDB(): boolean {
    if (fs.existsSync(filename!)) {
      console.log(warning("DB file already exists."));
      return false;
    }
    try {
      fs.writeFileSync(filename!, "[]", "utf-8");
      console.log(success("DB file created successfully."));
      return true;
    } catch (error) {
      throw new Error("Cannot write to " + filename);
    }
  }

  /** Resets the database file by overwriting its content with an empty JSON array */
  static resetDB(): boolean {
    try {
      fs.writeFileSync(filename!, "[]", "utf-8");
      console.log(success("DB file reset to empty."));
      return true;
    } catch (error) {
      throw new Error("Cannot write to " + filename);
    }
  }

  /** Checks whether the database file already exists */
  static DBExists(): boolean {
    return fs.existsSync(filename!);
  }

  /** Retrieves a task object from the database by its ID */
  static getTaskByID(id: number | string): Task | null {
    if (!DB.DBExists()) {
      DB.createDB();
      return null;
    }

    try {
      const data: Task[] = JSON.parse(fs.readFileSync(filename!, "utf-8"));
      const task = data.find((t) => t.id === Number(id));
      return task || null;
    } catch (error: any) {
      throw new Error("Syntax error in DB file. " + error.message);
    }
  }

  /** Retrieves a task object from the database by its title */
  static getTaskByTitle(title: string): Task | null {
    if (!DB.DBExists()) {
      DB.createDB();
      return null;
    }

    try {
      const data: Task[] = JSON.parse(fs.readFileSync(filename!, "utf-8"));
      const task = data.find((t) => t.title === title);
      return task || null;
    } catch (error: any) {
      throw new Error("Syntax error in DB file. " + error.message);
    }
  }

  /** Retrieves all tasks from the database */
  static getAllTask(): Task[] | null {
    if (!DB.DBExists()) {
      DB.createDB();
      return null;
    }

    try {
      const data: Task[] = JSON.parse(fs.readFileSync(filename!, "utf-8"));
      return data;
    } catch (error: any) {
      throw new Error("Syntax error in DB file. " + error.message);
    }
  }
}
