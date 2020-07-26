import { Action } from "../action";
import { waitForNetworkIdle } from "../utils";

export const ClickAClickable: Action = async (instance, selector: string = 'a, button, [role="button"]') => {
  await instance.page.$$eval(selector, clickables => {
    if (clickables.length === 0) return;
    let ind = Math.floor(Math.random() * clickables.length);
    (clickables[ind] as HTMLElement).click();
  })
  await waitForNetworkIdle(instance.page, 25)
}
