import { Page } from "puppeteer";

export function waitForNetworkIdle(page: Page, timeout: number, maxInflightRequests = 0) {
  page.on('request', onRequestStarted);
  page.on('requestfinished', onRequestFinished);
  page.on('requestfailed', onRequestFinished);

  let inflight = 0;
  let fulfill: () => void;
  let promise = new Promise(x => fulfill = x);
  let timeoutId = setTimeout(onTimeoutDone, timeout);
  return promise;

  function onTimeoutDone() {
      page.removeListener('request', onRequestStarted);
      page.removeListener('requestfinished', onRequestFinished);
      page.removeListener('requestfailed', onRequestFinished);
      fulfill();
  }

  function onRequestStarted() {
      ++inflight;
      if (inflight > maxInflightRequests)
          clearTimeout(timeoutId);
  }

  function onRequestFinished() {
      if (inflight === 0)
          return;
      --inflight;
      if (inflight === maxInflightRequests)
          timeoutId = setTimeout(onTimeoutDone, timeout);
  }
}

export function pickOne<T>(array: T[]): T {
  let ind = Math.floor(Math.random() * array.length);
  return array[ind]
}
