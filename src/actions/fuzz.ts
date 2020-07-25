import * as puppeteer from 'puppeteer';

var options:puppeteer.LaunchOptions = {};
if (process.env.CHROME_PATH) {
  options = {...options, executablePath: process.env.CHROME_PATH}
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
// Perform all tests in order
// If a test fails, report the failure and restart
// Perform all guards in order
// If a guard fails, restart.

(async() => {
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto('https://google.com');
  await page.screenshot({path: 'google.png'});
  await browser.close();
})();
