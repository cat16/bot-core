import CommandError from ".";
import Command from "..";
export default class InvalidArgumentProvided extends CommandError {
  private arg: string;
  private content: string;
  constructor(arg: string, content: string, command: Command) {
    super(command);
    this.arg = arg;
  }
  public getMessage() {
    return `Invalid argument was provided for argument '${
      this.arg
    }' of command '${this.getCommand().getFullName()}': '${this.content}'`;
  }
}
