import * as puppeteer from 'puppeteer';
import { Action, Failure } from './action';
import { printFailure, printWarning } from './output';
import { waitForNetworkIdle } from './utils';

export interface ActionFrequency {
  action: Action
  frequency: number
  args?: any[]
}
export type ActionArgs = Action | { action: Action, args: any[] }
function isAction(action: ActionArgs): action is Action {
  let test = (action as { action: Action, args: any[] });
  return !(test.action && test.args);
}

export interface FuzzOptions {
  actions: ActionFrequency[]
  tests: ActionArgs[]
  guards: ActionArgs[]
  actionCount: number,
  chromiumExecutablePath?: string,
  setup: (instance: PuppeteerInstance) => Promise<void>
}

export interface BrowserEvent {
  type: "PageError",
  payload: any
}

export interface PuppeteerInstance {
  browser: puppeteer.Browser
  page: puppeteer.Page
  history: BrowserEvent[]
  options: FuzzOptions
  errorCount: number
}

async function setupPuppeteer(options: FuzzOptions): Promise<PuppeteerInstance> {
  const browser = await puppeteer.launch((options.chromiumExecutablePath ? {executablePath: options.chromiumExecutablePath} : {}));
  const page = await browser.newPage();
  return {browser, page, history: [], options, errorCount: 0}
}

function subscribeToEvents(instance: PuppeteerInstance) {
  instance.page.on("console", msg => {
    if (["error", "assert"].indexOf(msg.type()) < 0) { return }
    instance.history.push({ type: "PageError", payload: msg.text() + "\n" + msg.args().map(x => x.jsonValue()).join("\n")});
  });
}

function reset(instance: PuppeteerInstance) {
  instance.history = [];
  return instance.options.setup(instance)
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

async function fuzzAction(instance: PuppeteerInstance): Promise<void | Failure> {
  let action = pickAction(instance.options.actions);
  try {
    return await action.action(instance, ...(action.args || []))
  } catch(e) {
    return e as Failure
  }
}

async function nonFuzzAction(instance: PuppeteerInstance, action: ActionArgs) {
  try {
      if (isAction(action)) {
      return await action(instance)
    } else {
      return await action.action(instance, ...action.args)
    }
  } catch(e) {
    return e as Failure
  }
}

async function handleFailure(instance: PuppeteerInstance, action: () => Promise<void | Failure>): Promise<boolean> {
  let result = await action();
  if (result) {
    instance.errorCount++
    printFailure(result, instance.errorCount)
    await instance.page.screenshot({path: `${instance.errorCount}.png`});
    await reset(instance);
    return true
  }
  return false
}

async function handleGuard(instance: PuppeteerInstance, action: () => Promise<void | Failure>): Promise<boolean> {
  let result = await action();
  if (result) {
    printWarning(result)
    await reset(instance);
    return true
  }
  return false
}

async function fuzzOne(instance: PuppeteerInstance) {
  if (await handleFailure(instance, () => fuzzAction(instance))) {
    return
  }
  await waitForNetworkIdle(instance.page, 25);

  for (let i = 0; i < instance.options.tests.length; i++) {
    if(await handleFailure(instance, () => nonFuzzAction(instance, instance.options.tests[i]))) {
      return;
    }
  }
  for (let i = 0; i < instance.options.guards.length; i++) {
    if(await handleGuard(instance, () => nonFuzzAction(instance, instance.options.guards[i]))) {
      return;
    }
  }
}

export async function fuzz(options: FuzzOptions) {
  const instance = await setupPuppeteer(options)
  await reset(instance);
  subscribeToEvents(instance);

  for(var i = 0; i < options.actionCount; i++) {
    await fuzzOne(instance);
  }
  await instance.browser.close();
}
