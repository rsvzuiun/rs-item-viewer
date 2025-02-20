import { carving } from "./carving";
import * as C from "./const";
import { Item } from "./types";

export const value = (
  arg: number | [number, number],
  func?: (x: number) => string
): string => {
  if (typeof arg === "number") {
    return `${func ? func(arg) : arg.toLocaleString()}`;
  } else {
    return func ? `[${func(arg[0])}~${func(arg[1])}]` : `[${arg[0]}~${arg[1]}]`;
  }
};
export const special_option = (kind: string, v: number): string | undefined => {
  switch (kind) {
    case "abnormal":
      switch (v) {
        case 0:
          return "異常系";
        case 1:
          return "呪い系";
        case 2:
          return "低下系";
        case 14:
          return "出血";
        default:
          return undefined;
      }
    case "damage_attr":
      return `${["火", "水", "風", "大地", "光", "闇"][v]}`;
    case "damage_type":
      return `${["物理", "魔法"][v]}`;
    case "inc_or_dec":
      return `${["増加", "減少"][v]}`;
    case "jobtype":
      return C.job_type[v];
    case "carving":
      return carving[v]?.name || `${v}`;
    default:
      return undefined;
  }
};
export function replaceOpText(
  text: string | undefined,
  args: (number | [number, number])[],
  extra: [number, number, number, number]
) {
  if (typeof text === "undefined") return "undefined";
  text = text
    .replace(/\r?\n/g, "<br />&nbsp;")
    .replace(
      /\[(?<sign>[+-]?)(?<special>[^[]*?)(?<idx>[0-7])(?<div>\.1)?(?<post>[%％]?)\]/g,
      (_org, sign, special, idx, div, post) => {
        let body = "";
        const v = special === "F" ? extra[idx] : args[idx];
        const func = div ? (x: number) => (x / 10).toFixed(1) : undefined;
        if (typeof v === "number") {
          body = special_option(special, v) ?? value(v, func);
        } else {
          body = value(v, func);
        }
        return /* html */ `<span class='text-color-LTYELLOW'>${sign}${body}${post}</span>`;
      }
    )
    .replace("%", "％");
  return replaceColorTag(text);
}
export const replaceTextData = (text: string): string => {
  return replaceColorTag(String(text).replace(/\r?\n/g, "<br />"));
};
export const replaceColorTag = (text: string): string => {
  return text.replace(
    /<c:([^> ]+?)>(.+?)<n>/g,
    (_string, matched1, matched2) => {
      return /* html */ `<span class='text-color-${matched1}'>${matched2}</span>`;
    }
  );
};
export const opPrtValue = (
  item: Item,
  idx: number
): (number | [number, number])[] => {
  return item.OpPrt[idx].ValueIndex.map((index) => {
    if (index == 2) return NaN;
    const min = item.ValueTable?.[index]?.[0];
    const max = item.ValueTable?.[index]?.[1];
    if (min === max) return min;
    return [min, max];
  });
};
