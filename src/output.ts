import { Failure } from "./action";

function consoleRed(string: string) {
  process.stdout.write('\x1b[31m' + string + '\x1b[0m');
}

function consoleYellow(string: string) {
  process.stdout.write('\x1b[33m' + string + '\x1b[0m');
}

export function consoleTemporary(string: string) {
  process.stdout.write('\x1b[K' + string + '\r');
}

export function printFailure(failure: Failure, count: number) {
  consoleRed(`\n[Failure ${count}]:`)
  console.log("  " + failure.message);
  if (failure.backtrace) {
    console.log("  " + failure.backtrace.join("\n  "))
  }
  if (failure.payload) {
    console.log("  " + failure.payload);
  }
}

export function printWarning(failure: Failure) {
  consoleYellow("\nWarning: ")
  console.log(failure.message);
}
