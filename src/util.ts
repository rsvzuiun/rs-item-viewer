import * as C from "./const";
import { Item } from "./types";

export const equals = (a: object, b: object) =>
  JSON.stringify(a) === JSON.stringify(b);

export const yellow = (text: string | number) =>
  /* html */ `<span class='text-color-LTYELLOW'>${text}</span>`;

export function replaceOpSpecial(text: string, ...args: (string | number)[]) {
  text = String(text)
    .replace(
      "スキルレベル [+0]([1]系列 職業)",
      `<c:LTYELLOW>${C.job_type[args[1] as number]}<n> スキルレベル [+0]`
    )
    .replace(
      "$func837[0]",
      `<c:LTYELLOW>${["異常系", "呪い系", "低下系"][args[0] as number]}<n>`
    )
    .replace("$func837[1]", args[1] > 0 ? "物理 攻撃力[1]％ 増加" : "")
    .replace("$func837[2]", args[2] > 0 ? "魔法 攻撃力[2]％ 増加" : "")
    .replace("$func838[0]", args[0] === 14 ? "<c:LTYELLOW>出血<n>" : "[0]")
    .replace(
      "$func843[1]",
      `<c:LTYELLOW>${["火", "1", "2", "3", "光"][args[1] as number]}<n>`
    )
    .replace(
      "$func844[0]",
      `<c:LTYELLOW>${["火", "1", "2", "3", "光"][args[0] as number]}<n>`
    )
    .replace(
      "$func853[1]",
      `<c:LTYELLOW>${["0", "1", "風", "3", "4"][args[1] as number]}<n>`
    )
    .replace(
      "$func942[0]",
      `<c:LTYELLOW>${["物理", "魔法"][args[0] as number]}<n>`
    )
    .replace(
      "$func945[1]",
      `<c:LTYELLOW>${["増加", "減少"][args[1] as number]}<n>`
    )
    .replace(
      "$func951[1]",
      `<c:LTYELLOW>${["0", "1", "2", "3", "4", "??系"][args[1] as number]}<n>`
    );
  return text;
}

export function replaceOpText(text: string, ...args: (string | number)[]) {
  text = replaceOpSpecial(text, ...args)
    .replace(/\r\n/g, "<br />&nbsp;")
    .replace(/\[([+-]?)([0-7])\](0*％?)/g, (_org, sign, opid, post) => {
      return yellow(`${sign}${args[parseInt(opid)].toLocaleString()}${post}`);
    });
  return replaceColorTag(text);
}

export const replaceTextData = (text: string): string => {
  return replaceColorTag(String(text).replace(/\r\n/g, "<br />"));
};

export const replaceColorTag = (text: string): string => {
  return text.replace(
    /<c:([^> ]+?)>(.+?)<n>/g,
    (_string, matched1, matched2) => {
      return /* html */ `<span class='text-color-${matched1}'>${matched2}</span>`;
    }
  );
};

export const opPrtValue = (item: Item, idx: number): string[] => {
  return item.OpPrt[idx].ValueIndex.map((index) => {
    if (index == 2) return "null";
    const min = item.ValueTable?.[index]?.[0];
    const max = item.ValueTable?.[index]?.[1];
    if (min === max) return `${min}`;
    return `[${min}~${max}]`;
  });
};
