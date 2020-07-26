import * as puppeteer from 'puppeteer';
import { Action, Failure } from './actions/action';
import { TestAction, TestActionSuccess } from './actions/testAction';
import { printFailure, printWarning } from './output';

var puppeteerOptions:puppeteer.LaunchOptions = {};
if (process.env.CHROME_PATH) {
  puppeteerOptions = {...puppeteerOptions, executablePath: process.env.CHROME_PATH}
}

// Two ways of executing an action; puppeteer and in-browser
// Three kinds of action: an action, a test, and a guard.
//
// An action is a randomly selected UI fuzzing behavior. It returns a null
// promise; it is assumed to have run successfully when the promise completes.
//
// A test is an invariant check. All tests run after each randomly selected
// action. A test can return false if it passes, or else return a test failure
// object
//
// A guard ensures the fuzzer never runs outside the bounds of the test area --
// by checking the URL against a regex, for instance. Every guard is run after
// each action. If a guard returns true, the test is reset. (If a guard can
// correct the test without restarting, it can do so and return false)
//
// The fuzzing loop is as follows:
// Pick an action based on weighted random
// Perform the action
// If the action fails, report the failure and restart
// Perform all tests in order
// If a test fails, report the failure and restart
// Perform all guards in order
// If a guard fails, restart.

export interface ActionFrequency {
  action: typeof Action
  frequency: number
  args?: any[]
}
export type ActionArgs = typeof Action | { action: typeof Action, args: any[] }
function isAction(action: ActionArgs): action is typeof Action {
  let test = (action as { action: typeof Action, args: any[] });
  return !(test.action && test.args);
}

export interface FuzzOptions {
  startUrl: string
  actions: ActionFrequency[]
  tests: ActionArgs[]
  guards: ActionArgs[]
  actionCount: number
}

async function setupPuppeteer() {
  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();
  return {browser, page}
}
function reset(page: puppeteer.Page, options: FuzzOptions) {
  return page.goto(options.startUrl);
}
function pickAction(actions: ActionFrequency[]): ActionFrequency {
  const totalFrequency = actions.reduce((sum, a) => sum + a.frequency, 0);
  const selection = Math.random() * totalFrequency;
  let runningTotal = 0;
  return actions.find(a => {
    runningTotal += a.frequency;
    return runningTotal >= selection;
  });
}
async function fuzzAction(browser: puppeteer.Browser, page: puppeteer.Page, options: FuzzOptions): Promise<void | Failure> {
  let action = pickAction(options.actions);
  try {
    return await (new action.action(action.args)).act(browser, page)
  } catch(e) {
    return e as Failure
  }
}
async function testAction(browser: puppeteer.Browser, page: puppeteer.Page, test: ActionArgs) {
  try {
      if (isAction(test)) {
      return await new test().act(browser, page)
    } else {
      return await new test.action(test.args).act(browser, page)
    }
  } catch(e) {
    return e as Failure
  }
}
async function guardAction(browser: puppeteer.Browser, page: puppeteer.Page, guard: ActionArgs) {
  try {
    if (isAction(guard)) {
      return await new guard().act(browser, page)
    } else {
      return await new guard.action(guard.args).act(browser, page)
    }
  } catch(e) {
    return e as Failure
  }
}
async function handleOutcome(page: puppeteer.Page, options: FuzzOptions, action: () => Promise<void | Failure>, printer: (f: Failure) => void = printFailure): Promise<boolean> {
  let result = await action();
  if (result) {
    printer(result)
    await reset(page, options);
    return true
  }
  return false
}

async function fuzzOne(browser: puppeteer.Browser, page: puppeteer.Page, options: FuzzOptions) {
  await handleOutcome(page, options, () => fuzzAction(browser, page, options));
  for (let i = 0; i < options.tests.length; i++) {
    if(await handleOutcome(page, options, () => testAction(browser, page, options.tests[i]))) {
      break;
    }
  }
  for (let i = 0; i < options.guards.length; i++) {
    if(await handleOutcome(page, options, () => guardAction(browser, page, options.guards[i]), printWarning)) {
      break;
    }
  }
}

async function fuzz(options: FuzzOptions) {
  const {browser, page} = await setupPuppeteer()
  await reset(page, options);

  for(var i = 0; i < options.actionCount; i++) {
    await fuzzOne(browser, page, options);
  }
  await browser.close();
}


let options: FuzzOptions = {
  actionCount: 100,
  actions: [
    {action: TestAction, frequency: 0.1},
    {action: TestActionSuccess, frequency: 1}
  ],
  guards: [],
  tests: [],
  startUrl: 'https://google.com'
}
fuzz(options);
