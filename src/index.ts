//src/index.ts
import chalk from "chalk";
import "dotenv/config";
import Action from "./action/action.js";

const command = process.argv[2];

const commands = [
  "list",
  "add",
  "delete",
  "delete-all",
  "edit",
  "export",
  "import",
  "download",
];

const error = chalk.redBright.bold;
const warning = chalk.yellowBright.bold;

if (command) {
  if (command === "list") {
    Action.list();
  }
} else {
  const message = [
    error("you must enter a command"),
    "available command are:",
    warning(commands.join("\n")),
  ].join("\n");

  console.log(message);
}
