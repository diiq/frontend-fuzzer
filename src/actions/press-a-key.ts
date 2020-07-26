import { Action } from "../action";
import { pickOne } from "../utils";

export const PressAKey: Action = async (instance, keys: string[] = "abcdefghijklmnopqrstuvwxyz1234567890".split('')) => {
  let key = pickOne(keys);
  await instance.page.keyboard.press(key);
}
