const { fuzz, ClickAClickable, FocusAFocusable, PressAKey, UrlGuard, PageErrorTest, NetworkErrorTest } = require('./build/index');

let options = {
  actionCount: 10000,
  actions: [
    {action: ClickAClickable, frequency: 1},
    {action: FocusAFocusable, frequency: .1},
    {action: PressAKey, frequency: 1},
  ],
  guards: [
  {action: UrlGuard, args: [/https:\/\/.*google\.com\/.*/]}
  ],
  tests: [
    PageErrorTest,
    NetworkErrorTest
  ],
  async setup(instance) {
    await instance.page.goto("https://www.google.com/")
  },
  chromiumExecutablePath: process.env.CHROME_PATH
}

fuzz(options);
