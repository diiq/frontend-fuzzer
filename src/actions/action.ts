import { Browser, Page } from "puppeteer";


export interface Failure {
  message: string
  backtrace: string
  payload: any
}

export type ActionType = "puppeteer" | "browser";

export class Action {
  constructor(args?: any[]) {}

  puppeteerAction: (browser: Browser, page: Page) => Promise<void|Failure>

  browserAction: () => void | Failure | Promise<void|Failure>;

  async act(browser: Browser, page: Page): Promise<void|Failure> {
    if (this.puppeteerAction) {
      return this.puppeteerAction(browser, page)
    } else if (this.browserAction) {
      return page.$eval('*', this.browserAction)
    }
  }
}
