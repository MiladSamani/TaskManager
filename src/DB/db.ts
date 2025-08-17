// src/DB/db.ts
import fs from "fs";
import chalk from "chalk";
import { Task } from "../types/task.js";

// Get the database file path from environment variables
const filename: string | undefined = process.env.DB_FILE;
if (!filename) {
  throw new Error("DB_FILE is not defined in environment variables.");
}

// Chalk styling for console output
const warning = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

/**
 * Database handler class for managing tasks in a JSON file.
 * Provides methods to create, read, update, and reset the task database.
 */
export default class DB {
  /**
   * Creates a new database file if it does not already exist.
   * Initializes it with an empty JSON array: `[]`
   *
   * @returns {boolean} - `true` if created, `false` if already exists
   */
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

  /**
   * Resets the database by overwriting the file with an empty array.
   * Useful for clearing all tasks.
   *
   * @returns {boolean} - `true` on success
   */
  static resetDB(): boolean {
    try {
      fs.writeFileSync(filename!, "[]", "utf-8");
      console.log(success("DB file reset to empty."));
      return true;
    } catch (error) {
      throw new Error("Cannot write to " + filename);
    }
  }

  /**
   * Checks whether the database file exists.
   *
   * @returns {boolean} - `true` if file exists, `false` otherwise
   */
  static DBExists(): boolean {
    return fs.existsSync(filename!);
  }

  /**
   * Retrieves a task by its ID.
   * If the database doesn't exist, it will be created.
   *
   * @param id - The ID of the task (number or string)
   * @returns {Task | null} - The task object if found, otherwise `null`
   */
  static getTaskByID(id: number | string): Task | null {
    if (!DB.DBExists()) {
      try {
        DB.createDB();
        return null;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }

    try {
      const data: Task[] = JSON.parse(fs.readFileSync(filename!, "utf-8"));
      const task = data.find((t) => t.id === Number(id));
      return task || null;
    } catch (error: any) {
      throw new Error("Syntax error in DB file. " + error.message);
    }
  }

  /**
   * Retrieves a task by its title.
   * Case-sensitive exact match.
   *
   * @param title - The title of the task
   * @returns {Task | null} - The task object if found, otherwise `null`
   */
  static getTaskByTitle(title: string): Task | null {
    if (!DB.DBExists()) {
      try {
        DB.createDB();
        return null;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }

    try {
      const data: Task[] = JSON.parse(fs.readFileSync(filename!, "utf-8"));
      const task = data.find((t) => t.title === title);
      return task || null;
    } catch (error: any) {
      throw new Error("Syntax error in DB file. " + error.message);
    }
  }

  /**
   * Retrieves all tasks from the database.
   *
   * @returns {Task[] | null} - Array of all tasks, or `null` if DB doesn't exist and can't be created
   */
 static getAllTasks(): Task[] {
  if (!DB.DBExists()) {
    DB.createDB();
    return [];
  }
  try {
    const data: Task[] = JSON.parse(fs.readFileSync(filename!, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    throw new Error("Syntax error in DB file. " + error.message);
  }
}

  /**
   * Saves a new task or updates an existing one.
   *
   * If `id` is 0, a new task is created with an auto-generated ID.
   * If `id` is provided, it updates the existing task with that ID.
   *
   * @param id - Task ID (0 = auto-generate)
   * @param title - Task title (min 3 characters)
   * @param completed - Completion status (default: false)
   * @returns The ID of the saved task (auto-generated if new)
   * @throws Error if validation fails, task not found, or save fails
   */
  static saveTask(id = 0, title: string, completed = false): number {
    id = Number(id);

    // Validate ID
    if (id < 0 || !Number.isInteger(id)) {
      throw new Error(
        "id must be an integer and greater than or equal to zero."
      );
    }

    // Validate title
    if (typeof title !== "string" || title.length < 3) {
      throw new Error(
        "title must be a string and at least three characters long."
      );
    }

    let data: Task[] = [];
    if (DB.DBExists()) {
      const rawData = fs.readFileSync(filename!, "utf-8");
      data = JSON.parse(rawData);
    } else {
      DB.createDB();
    }

    let finalId = id;

    if (id === 0) {
      // Case 1: Creating a new task → assign a new auto-incremented ID
      finalId = data.length > 0 ? data[data.length - 1].id + 1 : 1;

      // Validate that no other task already has the same title
      if (data.find((t) => t.title === title)) {
        throw new Error("A task with this title already exists.");
      }

      data.push({ id: finalId, title, completed });
    } else {
      // Case 2: Updating an existing task
      const existingTask = data.find((t) => t.id === id);
      if (!existingTask) throw new Error("Task not found");

      // Validate that no other task (different ID) has the same title
      const duplicate = data.find((t) => t.title === title && t.id !== id);
      if (duplicate) throw new Error("Another task already has this title.");

      existingTask.title = title;
      existingTask.completed = completed;
    }

    fs.writeFileSync(filename!, JSON.stringify(data, null, 2), "utf-8");
    return finalId;
  }

  /**
   * Inserts multiple tasks into the database in bulk.
   *
   * Accepts either:
   * - a JSON string representing an array of Task objects, or
   * - a direct array of Task objects.
   *
   * The method will overwrite the entire DB file with the new data.
   *
   * @param data - JSON string or array of Task objects
   * @throws {Error} - If data is invalid JSON or not an array
   * @throws {Error} - If the file cannot be written
   */
  static insertBulkData(data: string | Array<Task>) {
    // Case 1: If data is a string, try to parse it as JSON
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (error) {
        throw new Error("Invalid data: Could not parse JSON string.");
      }
    }

    // Case 2: Validate that data is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data: Must be an array of Task objects.");
    }

    // Convert the array into a formatted JSON string
    const json = JSON.stringify(data, null, 2);

    // Write data to the DB file
    try {
      fs.writeFileSync(filename!, json, "utf-8");
      console.log(success("Bulk data inserted successfully."));
    } catch (error) {
      throw new Error("Cannot write to DB file.");
    }
  }

  /**
   * Deletes a task from the database by its ID.
   *
   * @param id - Task ID (number or string, must be positive integer)
   * @returns {boolean} - Returns true if deleted successfully, false if task not found
   */
  static deleteTaskByID(id: number | string): boolean {
    id = Number(id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("task id must be a positive integer");
    }

    let data: Task[];

    try {
      const raw = fs.readFileSync(filename!, "utf-8");
      data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) {
        throw new Error("DB file is not in expected format");
      }
    } catch (error) {
      throw new Error("Cannot read DB file: " + (error as Error).message);
    }

    const initialLength = data.length;
    data = data.filter((task) => task.id !== id);

    if (data.length === initialLength) {
      return false; // task with this id not found
    }

    try {
      fs.writeFileSync(filename!, JSON.stringify(data, null, 4), "utf-8");
      return true; // successfully deleted
    } catch (error) {
      throw new Error("Cannot write to DB file: " + (error as Error).message);
    }
  }
}
