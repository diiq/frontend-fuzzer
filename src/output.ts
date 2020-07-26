import { Failure } from "./actions/action";

function consoleRed(string: string) {
  process.stdout.write('\x1b[31m' + string + '\x1b[0m');
}

function consoleYellow(string: string) {
  process.stdout.write('\x1b[33m' + string + '\x1b[0m');
}

export function printFailure(failure: Failure) {
  consoleRed("Failure: ")
  console.log(failure);
}

export function printWarning(failure: Failure) {
  consoleYellow("Warning: ")
  console.log(failure);
}
