import { Failure } from "./action";

function consoleRed(string: string) {
  process.stdout.write('\x1b[31m' + string + '\x1b[0m');
}

function consoleYellow(string: string) {
  process.stdout.write('\x1b[33m' + string + '\x1b[0m');
}

export function consoleTemporary(string: string) {
  process.stdout.write(string + '\r');
}

export function printFailure(failure: Failure) {
  consoleRed("\nFailure: ")
  console.log(failure.message);
  console.log(failure)
  // TODO: backtrace, payload
}

export function printWarning(failure: Failure) {
  consoleYellow("\nWarning: ")
  console.log(failure.message);
}
