interface HTMLCollectionOf<T extends Element> {
  [Symbol.iterator](): IterableIterator<T>
}
