import { Action, ActionType, Failure } from './action';

export class TestAction extends Action {
  type: ActionType = "browser"
  browserAction = (): void | Failure => {
    throw Error("whoops")
    return { message: document.title, backtrace: "", payload: 5 } as Failure;
  }
}

export class TestActionSuccess extends Action {
  type: ActionType = "browser"
  browserAction = () => {
    console.log("wheee");
    return;
  }
}
