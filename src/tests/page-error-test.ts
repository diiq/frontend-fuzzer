import { Action } from "../action";
import { isNetworkError } from "./network-error-test";

export const PageErrorTest: Action = async (instance) => {
  const errorHistory = instance.history.filter(h => h.type == "PageError" && !isNetworkError(h))
  if (errorHistory.length > 0) {
    return { message: `Console error: ${errorHistory.map(h => h.payload).join(", ")}` }
  }
}
