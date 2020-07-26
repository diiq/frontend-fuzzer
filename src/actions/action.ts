import { Browser, Page } from "puppeteer";
import  * as fs from 'fs';

interface Failure {
  message: string
  backtrace: string
  payload: any
}

export class Action {
  type: "puppeteer" | "browser";
  constructor() {

  }

  async puppeteerAction(browser: Browser, page: Page): Promise<void|Failure>  {
    throw EvalError("You must override puppeteerAction");
  }

  async browserAction(): Promise<void|Failure> {
    throw EvalError("You must override puppeteerAction");
  }

  async act(browser: Browser, page: Page): Promise<void|Failure> {
    if (this.type == "puppeteer") {
      return this.puppeteerAction(browser, page)
    } else if (this.type == "browser") {
      return page.$eval('*', this.browserAction)
    }
  }
}
