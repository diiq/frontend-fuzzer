import { Action } from "../action";

export const FocusAFocusable: Action = async (instance, selector: string = 'a, button, input:not([type="hidden"]), select, textarea, [tabindex]') => {
  await instance.page.$$eval(selector, focusables => {
    if (focusables.length === 0) return;
    let ind = Math.floor(Math.random() * focusables.length);
    (focusables[ind] as HTMLElement).click();
  })
}
