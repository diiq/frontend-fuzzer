# Frontend Fuzzer

UI fuzz testing is like handing your computer to a monkey, and watching carefully to see what damage they manage to do. It is not targeted, or surgical, but if your app is already in good shape, it can give you confidence that even extremely unexpected user behavior won't cause it to break down.

This is NOT a good fuzz tester. Good fuzz testers are fast, good at guessing interesting test cases, and can reduce complicated failures to the minimum number of steps. This package does none of those things.

However, I have been unable to find *any* usable web UI fuzz testing tools at all -- so on the doubtful principle that something is better than nothing, here's something.

## Design

Frontend Fuzzer is based on three kinds of action: fuzz actions, tests, and guards.

- A fuzz action is a randomly selected UI fuzzing behavior, like clicking a random link, or focusing a random form element.
- A test checks some expected invariant -- for instance "no errors were printed to the console" or "No 500s were returned by the server".
- A guard is a guard-rail for the testing-monkey. For instance, a guard makes sure you're fuzz testing *your* website, not sneaking off and doing damage on the rest of the internet.

Any of these actions can either succeed or fail.

When an action fails, that failure is recorded, and the fuzzer is reset to start again from the beginning.

The fuzzing loop is as follows:
* Reset the test (visit the site, log in, etc)
* [a] Pick a (weighted) random fuzz action
* Perform the action
* If the action fails, report the failure, take a screenshot and restart
* Otherwise, perform all the tests, in order
* If a test fails, report the failure, take a screenshot, and restart
* Otherwise, perform all the guards in order
* If a guard fails, print a warning and restart
* Otherwise, loop from [a]

## Usage

```
npm install --save-dev frontend-fuzzer
```

```js
const { fuzz, ClickAClickable, FocusAFocusable, PressAKey, UrlGuard, PageErrorTest, NetworkErrorTest } = require('frontend-fuzzer');

let options = {
  actionCount: 10000,                             // How many total fuzzing actions to take before exiting the loop
  actions: [                                      // Which fuzz actions to take, and how often
    {action: ClickAClickable, frequency: 1},
    {action: FocusAFocusable, frequency: .1},
    {action: PressAKey, frequency: 1},
  ],
  guards: [                                       // Which guards to run.
    {                                             // Some actions take extra arguments; the url guard takes a regex to match urls against.
      action: UrlGuard,
      args: [/localhost:3000\/.*/]
    }
  ],
  tests: [                                        // Which tests to run
    PageErrorTest,
    NetworkErrorTest                              // NetworkErrorTest takes arguments optionally, but we're sticking with the defaults.
  ],
  async setup(instance) {                         // Setup runs before each testing cycle; it should be idempotent.
    await instance.page.goto("localhost:3000/login")

    // Be sure to use a disposable account if testing on a live site
    // it will be filled with garbage data by the time this is over.
    await instance.page.type("input.email", process.env.LOGIN)
    await instance.page.type("input.password", process.env.PASSWORD)
    await instance.page.click(".action-submit")
    await instance.page.waitForNavigation();
    await instance.page.goto("localhost:3000/start-fuzzing-here")
  },

  // If, like me, you're running on an unconventional setup, this points puppeteer to the right chromium.
  // This is optional.
  chromiumExecutablePath: process.env.CHROME_PATH
}

// Start fuzzing!
fuzz(options);
```

### Available Fuzz Actions

- ClickAClickable
  Picks a random DOM object based on a selector, and triggers its click event. The default selector is `'a, button, [role="button"]'`. This will be replaced by the action's first argument: `{action: ClickAClickable, frequency: 1, args: ['a.navLink']}`

- FocusAFocusable
  Picks a random DOM object based on a selector, and focuses it. The default selector is `'a, button, input:not([type="hidden"]), select, textarea, [tabindex]'`. This will be replaced by the action's first argument: `{action: FocusAFocusable, frequency: 1, args: ['input.formField']}`

- PressAKey
  Triggers a random keypress. Selected by default from lowercase a-z and 0-9, but this list can be replaced by the action's first argument: `{action: FocusAFocusable, frequency: 1, args: ['ArrowLeft', 'ArrowDown']}`

### Available Tests
- PageErrorTest
  Triggers on any non-network console error.

- NetworkErrorTest
  Triggers on console errors of the form "the server responded with a status of XXX". By default, it only fails for 500 statuses, but the list of failing statuses can be replaced by the test's first argument: `{action: NetworkErrorTest, args: [500, 401, 422]}`

### Available Guards

- UrlGuard
  Resets the test when the url stops matching the given regex. One argument, the url regex, is **required**. `{action: UrlGuard, args: [/localhost:3000\/.*/]}`

### Writing your own actions

An action is an async function that takes a PuppeteerInstance and returns either a Failure or null.

```ts
interface PuppeteerInstance {
  browser: puppeteer.Browser
  page: puppeteer.Page
  history: BrowserEvent[]  // A list of console log errors
  options: FuzzOptions
  errorCount: number       // The number of times a fuzz action or test has failed
}

export interface Failure {
  message: string
  backtrace?: string[]
  payload?: any
}

export type Action = (instance: PuppeteerInstance, ...args: any[]) => Promise<void|Failure>
```

## Features desperately needed

- The actual failure reporting is inexcusably bad. Track the events, give better stack trackes, etc. Group screenshots with relevant failure data.
- More fuzz actions: touch input, drag-n-drop, key combos, right clicks, etc.
