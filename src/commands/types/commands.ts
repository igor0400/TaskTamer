export interface CommandType {
  titles: string[];
  replaceArgs: string[];
  action: (args: string[]) => void | Promise<any>;
}
