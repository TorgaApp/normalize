declare module 'torga-normalize' {
  export interface AdditionalIndex {
    name: string;
    keys: string[];
  }

  export interface StateObject {
    id: string;
    [key: string]: any;
  }

  export interface State {
    byID: { [key: string]: StateObject };
    allIDs: string[];
    idsBy?: { [key: string]: { [key: string]: any } };
    rootID?: string;
    [key: string]: any;
  }

  export interface Config {
    fields: string[];
    objects: { name: string }[];
    keys: string[];
  }

  export type NormalizeFunction = (
    state: State,
    objects: Iterable<StateObject>,
    additionalIndexes?: AdditionalIndex[]
  ) => State;
  export type AddIndexFunction = (
    name: string,
    builder: (obj: StateObject) => [string, any],
    state: State
  ) => State;
  export type NormJoinFunction = (
    state: State,
    joins: any[],
    config: Config
  ) => State;
  export type HandleErrorFunction = (
    state: any[],
    error: any,
    module?: string
  ) => any[];

  export const normalize: NormalizeFunction;
  export const add_index: AddIndexFunction;
  export const normjoin: NormJoinFunction;
  export const handleError: HandleErrorFunction;
}
