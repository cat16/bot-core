import FileElement from ".";

export default abstract class RecursiveFileElement<
  T extends RecursiveFileElement<T>
> extends FileElement {
  public readonly parent?: T;
  public readonly children: T[];

  constructor(fileName: string, parent?: T) {
    super(fileName);
    this.parent = parent;
    this.children = [];
  }

  public getFilePath(separator: string = "/"): string {
    return this.parent
      ? `${this.parent.getFilePath()}${separator}${this.getFileName()}`
      : this.getFileName();
  }

  public removeChild(child: T): void {
    const childIndex = this.children.findIndex(
      c => c.getFileName() === child.getFileName()
    );
    if (childIndex === -1) {
      return;
    }
    this.children.splice(childIndex, 1);
  }

  public replaceChild(child: T): T {
    const index = this.children.findIndex(
      c => c.getFileName() === child.getFileName()
    );
    if (index === -1) {
      return null;
    } else {
      const oldChild = this.children[index];
      this.children[index] = child;
      return oldChild;
    }
  }
}