import { PuppeteerInstance } from "./fuzz";


export interface Failure {
  message: string
  backtrace?: string
  payload?: any
}

export type Action = (instance: PuppeteerInstance, ...args: any[]) => Promise<void|Failure>
