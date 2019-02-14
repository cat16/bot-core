import DatabaseVariable from "./database-variable";

// this is going to be a db variable but stored in ram while the program is running so it's just a saved variable

export default class SavedVariable<T> extends DatabaseVariable<T> {
  private value: T;

  public getValue(): T {
    if (!this.dbi.isLoaded()) {
      throw new Error("Database not initialized");
    }
    return this.value;
  }

  public async get(): Promise<T> {
    return this.value;
  }

  public async set(value: T): Promise<void> {
    this.value = value;
    return super.set(value);
  }

  public async sync(): Promise<T> {
    this.value = await super.get();
    return this.value;
  }

  public async init(): Promise<void> {
    this.value = await super.get();
  }
}
