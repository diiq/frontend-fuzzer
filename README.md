# Frontend Fuzzer

UI fuzz testing is like handing your computer to a monkey, and watching carefully to see what damage they manage to do. It is not targeted, or surgical, but if your app is already in good shape, it can give you confidence that even extremely unexpected user behavior won't cause it to break down.

This is NOT a good fuzz tester. Good fuzz testers are fast, good at guessing interesting test cases, and can reduce a complicated failure to the minimum number of steps. This does none of those things.

However, I have been unable to find any web-frontend fuzz testing tools at all -- so on the doubtful principle that something is better than nothing, here's something.

## Design

Three kinds of action: fuzz actions, tests, and guards.

A fuzz action is a randomly selected UI fuzzing behavior, like clicking a random link, or focusing a random form element.
A test checks some expected invariant -- for instance "no errors were printed to the console" or "No 500s were returned by the server".
A guard is a guard-rail for the testing-monkey. For instance, a guard makes sure you're fuzz testing *your* website, not sneaking off and doing damage on the rest of the internet.

All actions can either succeed, by returning null, or fail by returning a Failure object.

When an action fails, it's recorded, and the fuzzer is reset to start again from the beginning.

The fuzzing loop is as follows:
* Reset the test (visit the site, log in, etc)
* [a] Pick a (weighted) random fuzz action
* Perform the action
* If the action fails, report the failure and restart
* Otherwise, perform all the tests, in order
* If a test fails, report the failure and restart
* Otherwise, perform all the guards in order
* If a guard fails, restart
* Otherwise, loop from [a]

## Usage

See `example.js`.
