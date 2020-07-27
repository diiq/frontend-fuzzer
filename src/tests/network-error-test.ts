import { Action } from "../action";
import { BrowserEvent } from "../fuzz";

export const NetworkErrorTest: Action = async (instance, statuses = [500]) => {
  const errorHistory = instance.history.filter(h => h.type == "PageError" && statuses.indexOf(networkErrorStatus(h)) >= 0)
  if (errorHistory.length > 0) {
    return { message: `Console error: ${errorHistory.map(h => h.payload).join(", ")}` }
  }
}

const networkRegex = /the server responded with a status of (\d+)/
function networkErrorStatus(event: BrowserEvent) {
  let match = event.payload.match(networkRegex);
  if (match) {
    return parseInt(match[1]);
  }
  return false;
}

export function isNetworkError(event: BrowserEvent) {
  return !!networkErrorStatus(event);
}
