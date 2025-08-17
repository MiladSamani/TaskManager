import util from "util";

import DB from "../DB/db.js";
import chalk from "chalk";

/**
 * Represents a task in a task management system.
 * Each task has a unique ID, a title (with validation), and a completion status.
 * Uses private fields (with #) to encapsulate internal state.
 */
export default class Task {
  // Private fields
  #id: number = 0; // Unique identifier for the task (could be set in the future)
  #title!: string; // The title of the task (initialized via setter in constructor)
  #completed: boolean = false; // Completion status, defaults to false

  /**
   * Creates a new Task instance.
   * @param title - The title of the task (must be a string with at least 3 characters)
   * @param completed - Whether the task is completed (optional, defaults to false)
   */
  constructor(title: string, completed: boolean = false) {
    this.title = title; // Uses the setter to validate the title
    this.completed = completed; // Sets the completion status
  }

  /**
   * Gets the unique ID of the task.
   * Currently defaults to 0; in a real app, this could be auto-generated.
   * @returns The task's ID
   */
  get id(): number {
    return this.#id;
  }

  /**
   * Sets the title of the task with validation.
   * - Must be a string
   * - Must have at least 3 characters
   * @param value - The new title for the task
   * @throws Error if validation fails
   */
  set title(value: string) {
    if (typeof value !== "string" || value.length < 3) {
      throw new Error(
        "Title must be a string and contain at least 3 characters"
      );
    }
    this.#title = value;
  }

  /**
   * Gets the title of the task.
   * @returns The current title
   */
  get title(): string {
    return this.#title;
  }

  /**
   * Sets the completion status of the task.
   * Ensures the value is treated as a boolean (defensive programming).
   * @param value - The new completion status (true or false)
   */
  set completed(value: boolean) {
    this.#completed = Boolean(value); // Ensures the value is a proper boolean
  }

  /**
   * Gets the completion status of the task.
   * @returns True if the task is completed, false otherwise
   */
  get completed(): boolean {
    return this.#completed;
  }

  [util.inspect.custom]() {
    return `Task {
      id : ${chalk.yellowBright(this.id)}
      title : ${chalk.bgRed('"' + this.title + '"')}
      completed : ${chalk.blueBright(this.completed)}
    }`;
  }

  save() {
    try {
      const id = DB.saveTask(this.#id, this.#title, this.#completed);
      this.#id = id;
    } catch (error: any) {
      console.error("Failed to save task:", error.message);
      throw error;
    }
  }
}
