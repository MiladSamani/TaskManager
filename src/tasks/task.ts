// src/tasks/task.ts
import util from "util";
import DB from "../DB/db.js";
import chalk from "chalk";
import { Task as TaskType } from "../types/task.js";

/**
 * Represents a task in a task management system.
 * Each task has a unique ID, a title, and a completion status.
 */
export default class Task {
  /** @private @type {number} Unique identifier for the task */
  #id: number = 0;

  /** @private @type {string} Task title */
  #title!: string;

  /** @private @type {boolean} Task completion status */
  #completed: boolean = false;

  /**
   * Creates a new Task instance.
   * @param {string} title - The title of the task (must be at least 3 characters)
   * @param {boolean} [completed=false] - Whether the task is completed
   */
  constructor(title: string, completed: boolean = false) {
    this.title = title;
    this.completed = completed;
  }

  /**
   * @private
   * Sets the task ID internally.
   * @param {number} id - The ID to assign
   */
  private setId(id: number) {
    this.#id = id;
  }

  /**
   * Gets the unique ID of the task.
   * @returns {number} Task ID
   */
  get id(): number {
    return this.#id;
  }

  /**
   * Sets the title of the task with validation.
   * @param {string} value - New task title
   * @throws {Error} If the title is not a string or has fewer than 3 characters
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
   * Gets the task title.
   * @returns {string} Task title
   */
  get title(): string {
    return this.#title;
  }

  /**
   * Sets the completion status of the task.
   * @param {boolean} value - True if completed, false otherwise
   */
  set completed(value: boolean) {
    this.#completed = Boolean(value);
  }

  /**
   * Gets the task completion status.
   * @returns {boolean} True if completed, false otherwise
   */
  get completed(): boolean {
    return this.#completed;
  }

  /**
   * Custom console representation using colors.
   * @returns {string} Colored string representation of the task
   */
  [util.inspect.custom]() {
    return `Task {
      id : ${chalk.yellowBright(this.id)}
      title : ${chalk.bgRed('"' + this.title + '"')}
      completed : ${chalk.blueBright(this.completed)}
    }`;
  }

  /**
   * Saves the task to the database.
   * Updates the task ID if it is newly created.
   * @throws {Error} If saving fails
   */
  save() {
    try {
      const id = DB.saveTask(this.#id, this.#title, this.#completed);
      this.#id = id;
    } catch (error: any) {
      console.error("Failed to save task:", error.message);
      throw error;
    }
  }

  /**
   * Retrieves a task by its ID.
   * @param {number} id - Task ID
   * @returns {Task|null} Task instance if found, otherwise null
   */
  static getTaskById(id: number): Task | null {
    const task = DB.getTaskByID(id);
    if (task) {
      const item = new Task(task.title, task.completed);
      item.setId(id);
      return item;
    }
    return null;
  }

  /**
   * Retrieves a task by its title.
   * @param {string} title - Task title
   * @returns {Task|null} Task instance if found, otherwise null
   */
  static getTaskByTitle(title: string): Task | null {
    const task = DB.getTaskByTitle(title);
    if (task) {
      const item = new Task(task.title, task.completed);
      item.setId(task.id);
      return item;
    }
    return null;
  }

  /**
   * Retrieves all tasks from the database.
   * @returns {Task[]} Array of Task instances
   */
  static getAllTasks(rawObject = false): Task[] | TaskType[] {
     const tasks = DB.getAllTasks() ?? []; 

    if (rawObject) {
      return tasks;
    }

    const items: Task[] = [];
    for (const task of tasks!) {
      const item = new Task(task.title, task.completed);
      item.setId(task.id);
      items.push(item);
    }
    return items;
  }
}
