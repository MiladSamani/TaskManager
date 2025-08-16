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
  static getAllTask(): Task[] | null {
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
      return data;
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
   */
  static saveTask(id = 0, title: string, completed = false) {
    id = Number(id);

    // Validate ID: must be a non-negative integer
    if (id < 0 || !Number.isInteger(id)) {
      throw new Error(
        "id must be an integer and greater than or equal to zero."
      );
    }

    // Validate title: must be a string with at least 3 characters
    if (typeof title !== "string" || title.length < 3) {
      throw new Error(
        "title must be a string and at least three characters long."
      );
    }

    // Prevent duplicate titles (unless updating the same task)
    const existingTask = DB.getTaskByTitle(title);
    if (existingTask && existingTask.id !== id) {
      throw new Error("A task already exists with this title.");
    }

    let data;

    // Load existing data from file
    if (DB.DBExists()) {
      const rawData = fs.readFileSync(filename!, "utf-8");
      try {
        data = JSON.parse(rawData);
      } catch (error: any) {
        throw new Error("Syntax error in DB file: " + error.message);
      }
    } else {
      // Create new DB if it doesn't exist
      DB.createDB();
      data = [];
    }

    // Case 1: Create a new task (auto-generate ID)
    if (id === 0) {
      id = data.length > 0 ? data[data.length - 1].id + 1 : 1;
      data.push({ id, title, completed });
    }
    // Case 2: Update an existing task
    else {
      let taskFound = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          data[i].title = title;
          data[i].completed = completed;
          taskFound = true;
          break;
        }
      }
      if (!taskFound) {
        throw new Error("Task not found: No task with the given ID.");
      }
    }

    // Save updated data back to file
    const str = JSON.stringify(data, null, 2); // Pretty-print with 2 spaces
    try {
      fs.writeFileSync(filename!, str, "utf-8");
      console.log(success(`Task "${title}" saved successfully.`));
    } catch (error) {
      throw new Error("Could not save the task to the database.");
    }
  }
}
