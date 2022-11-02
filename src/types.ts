export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export type AtParam = {
  Range: number;
  Speed: number;
  Min: number;
  Max: number;
};

export type BaseOption = {
  Id: number;
  ValueIndex: Tuple<number, 4>;
};

// type OrdinalOption = { Id: Exclude<number, -1>; Value: number[] }
// type SpecialOption = { Id: -1; Text: string; Value: number[] }

// export type Option = OrdinalOption | SpecialOption
export type Option = {
  Id: number;
  Value: number[];
  Text?: string;
};

export type Require = {
  0?: number;
  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
  6?: number;
  7?: number;
  Extra?: RequireExtra;
};
export type RequireExtra = {
  StatusType: number;
  MulValue: number;
  ValueIndex: number;
};

export type Item = {
  Id: number;
  ImageId: number;
  NxId: number;
  Type: number;
  Name: string;
  Rank: "NX" | "U" | "N";
  Grade: "DX" | "UM" | "N";
  AtParam: AtParam;
  Food: number;
  ValueTable: Tuple<Tuple<number, 2>, 2>;
  OpPrt: BaseOption[];
  OpBit: Option[];
  OpNxt: Option[];
  Require: Require;
  Job: number[];
  Text: string;
  StackSize: number;
  Durability: number;
  DropLv: number;
  DropFactor: number;
  Price: number;
  PriceType: number;
  PriceFactor: number;
  Flags: string;
  Extra: number;
  Exclusive: boolean;
};

export type ItemData = ArrayLike<Item | undefined>;

export type TextData = {
  OptionProper: ArrayLike<string | undefined>;
  OptionBasic: ArrayLike<string | undefined>;
};
