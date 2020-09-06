#!/usr/bin/env node

//------------------------------------------------------------------------------
//  PRINT LOGO
//------------------------------------------------------------------------------
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");

clear();

console.log(chalk.white(figlet.textSync("SMCLI")));

console.log(chalk.blue("An inquirerjs cli powered by xstate\n\n"));

//------------------------------------------------------------------------------
//  INITIALIZE MACHINE
//------------------------------------------------------------------------------
const { createMachine, interpret, assign } = require("xstate");
const inquirer = require("inquirer");

const machineDefinition = createMachine({
  id: "ACMECLI",
  initial: "Entered",
  context: {
    user: null
  },
  states: {
    Entered: {
      invoke: {
        id: "setName",
        src: async (context, event) => {
          const { yourname } = await inquirer.prompt({
            name: "yourname",
            type: "input",
            message: "What's your name?",
            validate: function(value) {
              if (value.length) {
                return true;
              } else {
                return "Please type your name.";
              }
            }
          });

          console.log(`Hi ${yourname}!`);

          return yourname;
        },
        onDone: {
          target: "Idle",
          actions: assign({
            user: (_, event) => event.data
          })
        },
        onError: "Dead"
      }
    },
    Idle: {
      invoke: {
        id: "newCommand",
        src: async (context, event) => {
          const { command } = await inquirer.prompt({
            name: "command",
            type: "input",
            message: "What's next?",
            validate: function(value) {
              if (value.length) {
                return true;
              } else {
                return "Please type a command.";
              }
            }
          });

          return command;
        },
        onDone: [
          {
            target: "ExecutingWhoami",
            cond: (_, event) => event.data === "whoami"
          },
          {
            target: "Dead",
            cond: (_, event) => event.data === "quit"
          },
          { target: "Idle" }
        ],
        onError: "Dead"
      }
    },
    ExecutingWhoami: {
      invoke: {
        id: "getName",
        src: async (context, event) => console.log(context.user),
        onDone: {
          target: "Idle"
        },
        onError: "Dead"
      }
    },
    Dead: {
      type: "final"
    }
  }
});

interpret(machineDefinition).start();
