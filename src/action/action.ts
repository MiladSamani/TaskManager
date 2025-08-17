//src/action/action.ts
import chalk from "chalk";
import DB from "../DB/db.js";
import Task from "../tasks/task.js";
import inquirer from "inquirer";

const error = chalk.redBright.bold;
const warning = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

export default class Action {
  static list() {
    const tasks = Task.getAllTasks(true);
    if (tasks?.length) {
      console.table(tasks);
    } else {
      console.log(warning("there is not any task"));
    }
  }
  // static async add() {
  //   const answer = await inquirer.prompt([
  //     {
  //       type: "input",
  //       name: "title",
  //       message: "enter your title name :",
  //       validate: (value) => {
  //         if (value.length < 3) {
  //           return "the title must contain at least 3 letters.";
  //         }
  //         return false;
  //       },
  //     },
  //     {
  //       type: "confirm",
  //       name: "completed",
  //       message: "is this task completed?",
  //       default: false,
  //     },
  //   ]);

  //   try {
  //     const task = new Task(answer.title, answer.completed);
  //     task.save();
  //     console.log(success("new task saved successfully"));
      
  //   } catch (e : any) {
  //       console.log(error(e.message));
        
  //   }
  // }
}
