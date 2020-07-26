const { fuzz, ClickAClickable, FocusAFocusable, PressAKey, UrlGuard, PageErrorTest } = require('./build/fuzz');

let options = {
  actionCount: 10000,
  actions: [
    {action: ClickAClickable, frequency: 1},
    {action: FocusAFocusable, frequency: .1},
    {action: PressAKey, frequency: 1},
  ],
  guards: [
  {action: UrlGuard, args: [/https:\/\/.*vistimo\.com\/.*/]}
  ],
  tests: [
    PageErrorTest
  ],
  async setup(instance) {
    await instance.page.goto("https://www.vistimo.com/login")

    // Be sure to use a disposable account -- it will be filled with garbage by the time this is over.
    await instance.page.type("input.email", process.env.LOGIN)
    await instance.page.type("input.password", process.env.PASSWORD)
    await instance.page.click(".action-submit")
    await instance.page.waitForNavigation();
    await instance.page.goto("https://www.vistimo.com/project-list")
  },
}
fuzz(options);
