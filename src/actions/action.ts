import { Browser, Page } from "puppeteer";
import  * as fs from 'fs';

interface Failure {
  message: string
  backtrace: string
  payload: any
}

class Action {
  type: "puppeteer" | "browser";
  constructor() {

  }

  puppeteerAction(browser: Browser, page: Page) {
    throw EvalError("You must override puppeteerAction");
  }

  browserActionFile = "unimplementedBrowserAction.js"
  browserAction: string;
  getBrowserAction() {
    if (this.browserAction) {
      return this.browserAction;
    }
    let path = require('path');
    let filePath = path.join(__dirname, this.browserActionFile);
    this.browserAction = fs.readFileSync(filePath).toString();
  }

  async act(browser: Browser, page: Page): Promise<void|Failure> {
    if (this.type == "puppeteer") {
      this.puppeteerAction(browser, page)
    } else if (this.type == "browser") {
      this.getBrowserAction()
    }
  }
}
