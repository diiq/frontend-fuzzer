import { Action, Failure } from "../action";
import { consoleTemporary } from "../output";

export const UrlGuard: Action = async (instance, urlRegex: RegExp): Promise<void | Failure> => {
  let url = instance.page.url()
  consoleTemporary(`Visiting ${url}`)
  if (url.match(urlRegex)) {
    return
  }
  return { message: `URL Guard failure: ${url} does not match ${urlRegex}` };
}
