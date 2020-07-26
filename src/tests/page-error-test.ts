import { Action } from "../action";

export const PageErrorTest: Action = async (instance) => {
  if (instance.history.length > 0) {
    return { message: `Console error: ${instance.history.filter(h => h.type ="PageError").map(h => h.payload.split("\n")[0]).join(", ")}`, backtrace: instance.history[0].payload, payload: instance.history }
  }
}
