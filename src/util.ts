const none = Symbol();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cache<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  let ret: ReturnType<T> | typeof none = none;
  return (...args) => (ret === none ? (ret = func(...args)) : ret);
}

export const equals = (a: object, b: object) =>
  JSON.stringify(a) === JSON.stringify(b);

export const str2range = (str: string, max: number) => [
  ...new Set(
    str
      .split(",")
      .map((e) => {
        const m = e.match(/^(\d+)(-)?(\d+)?$/);
        if (m) {
          if (m[3]) {
            // begin-end
            const min = parseInt(m[1]);
            const max = parseInt(m[3]);
            return [...Array(max - min + 1)].map((_v, i) => i + min);
          } else if (m[2]) {
            // begin-
            const min = parseInt(m[1]);
            return [...Array(max - min + 1)].map((_v, i) => i + min);
          } else if (m[1]) {
            // id
            return parseInt(m[1]);
          }
        }
        return NaN;
      })
      .flat()
  ),
];
