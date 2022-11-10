import { TextData } from "../types";
import * as C from "../const";

export const index = (app: HTMLElement, textdata: TextData) => {
  const root = document.createDocumentFragment();
  const form = document.createElement("form");
  root.appendChild(form);
  form.action = ".";
  form.method = "get";
  form.innerHTML = /* html */ `
<label for='q'>キーワード:</label>
  <input type='text' name='q' id='q' /><br />
  (<a target='_blank' href='https://userweb.mnet.ne.jp/nakama/'>正規表現</a>が使えます 例:
  <a is='spa-anchor' href='?q=%5Eフ.%2Bン%24'>^フ.+ン$</a>
  <a is='spa-anchor' href='?q=ゲージング%7C辛苦'>ゲージング|辛苦</a>
  )
  <br />
<label for='selecttype'>部位: </label>
  <input type='text' id='selecttype' name='selecttype' list='selecttype-list' />
  <datalist id='selecttype-list'></datalist>
  <br />
<label for='selectop'>オプション:</label>
  <input type='text' id='selectop' name='selectop' list='selectop-list' />
  <datalist id='selectop-list'></datalist>
  <br />
<label for='selectjob'>職業:</label>
  <input type='text' id='selectjob' name='selectjob' list='selectjob-list' />
  <datalist id='selectjob-list'></datalist>
  <br />
等級:
  <input type='radio' name='rank' id='rank-all' value='' checked='checked' /><label for='rank-all'>全て</label>
  <input type='radio' name='rank' id='rank-N' value='N' /><label for='rank-N'>N</label>
  <input type='radio' name='rank' id='rank-U' value='U' /><label for='rank-U'><img src='img/ui/type-icon-U.gif' /></label>
  <input type='radio' name='rank' id='rank-NX' value='NX' /><label for='rank-NX'><img src='img/ui/type-icon-NX.gif' /></label>
  <br />
<label for='grade'>等級:</label>
  <input type='radio' name='grade' id='grade-all' value='' checked='checked' /><label for='grade-all'>全て</label>
  <input type='radio' name='grade' id='grade-N' value='N' /><label for='grade-N'>N</label>
  <input type='radio' name='grade' id='grade-DX' value='DX' /><label for='grade-DX'><img src='img/ui/type-icon-DX.gif' /></label>
  <input type='radio' name='grade' id='grade-UM' value='UM' /><label for='grade-UM'><img src='img/ui/type-icon-UM.gif' /></label>
  <br />
<label for='group'>フィルタ:</label>
  <input type='radio' name='group' id='group-all' value='' checked='checked' /><label for='group-all'>全て</label>
  <input type='radio' name='group' id='group-w' value='w' /><label for='group-w'>武器</label>
  <input type='radio' name='group' id='group-nw' value='nw' /><label for='group-nw'>武器以外</label>
  <br />
<label>除外設定:</label>
  <input type='checkbox' id='A' name='A' value='1' /><label for='A'>[A]</label>
  <input type='checkbox' id='D' name='D' value='1' /><label for='D'>[D]</label>
  <input type='checkbox' id='E' name='E' value='1' /><label for='E'>[E]</label>
  <input type='checkbox' id='G' name='G' value='1' /><label for='G'>[G]</label>
  <input type='checkbox' id='R' name='R' value='1' /><label for='R'>[R]</label>
  <br />
<button type='submit'>検索</button> <button type='reset' onclick='storage.clear();'>クリア</button>
`;

  const selectoplist = form.querySelector("#selectop-list");
  if (selectoplist == null) throw new Error();
  for (const [k, v] of Object.entries(textdata.OptionBasic)) {
    if (typeof v === "undefined") continue;
    const option = document.createElement("option");
    option.value = `${k}: ${v.replace(/<c:([^> ]+?)>(.+?)<n>/g, "$2")}`;
    selectoplist.appendChild(option);
  }

  const selecttypelist = form.querySelector("#selecttype-list");
  if (selecttypelist == null) throw new Error();
  for (const [k, v] of Object.entries(C.item_type)) {
    if (C.not_equipment.includes(parseInt(k))) continue;
    const option = document.createElement("option");
    option.value = `${k}: ${v}`;
    selecttypelist.appendChild(option);
  }

  const selectjoblist = form.querySelector("#selectjob-list");
  if (selectjoblist == null) throw new Error();
  for (const [k, v] of Object.entries(C.job_type)) {
    if (k === "40" || k === "41") continue;
    const option = document.createElement("option");
    option.value = `${k}: ${v}`;
    selectjoblist.appendChild(option);
  }

  const link = document.createElement("div");
  root.appendChild(link);
  link.innerHTML = /* html */ `
<a is='spa-anchor' href='?lv=775&grade=UM&rank=U&group=w&E=1'>775UMU武器</a>
<a is='spa-anchor' href='?lv=800&grade=DX&rank=U&group=w&E=1&R=1'>800DXU武器</a>
<a is='spa-anchor' href='?lv=1000&grade=UM&rank=U&group=w&E=1'>1000UMU武器</a>
<a is='spa-anchor' href='?q=%5E%28%E3%83%96%E3%83%AC%E3%82%A4%E3%83%96%7C%E3%83%AD%E3%82%A6%E3%83%90%E3%82%B9%E3%83%88%7C%E3%82%A4%E3%83%B3%E3%83%86%E3%83%AA%29&group=w'>ブレイブ・インテリ・ロウバスト</a>
<a is='spa-anchor' href='?q=%5E%28%E3%82%AF%E3%83%AD%E3%82%A6%7C%E3%82%B7%E3%83%A3%E3%82%A4%E3%82%A8%E3%83%B3%29'>クロウ・シャイエン</a>
<a is='spa-anchor' href='?lv=1100&grade=DX&rank=U&group=w'>1100DXU武器</a>
<a is='spa-anchor' href='?lv=1250&grade=UM&rank=U&group=w'>1250UMU武器</a>
<br />
<a is='spa-anchor' href='?id=8285-8301'>BFU防具</a>
<a is='spa-anchor' href='?q=%5C%5B%E9%81%BA%E7%89%A9%5C%5D'>遺物</a>
<a is='spa-anchor' href='?lv=775&id=9122-&grade=UM&rank=U&group=nw&E=1'>775UMU防具</a>
<a is='spa-anchor' href='?lv=800&grade=DX&rank=U&group=nw&E=1&R=1'>800DXU防具</a>
<a is='spa-anchor' href='?lv=1000&grade=UM&rank=U&group=nw&E=1'>1000UMU防具</a>
<a is='spa-anchor' href='?lv=1100&grade=DX&rank=U&group=nw'>1100DXU防具</a>
<a is='spa-anchor' href='?id=11976-12023,12155-12158'>1000UMU職鎧</a>
<a href='?kr=1&id=12818-12853'>[韓国]1250UMU防具</a>
`;

  root.appendChild(buildToc(toc));
  const link_foot = document.createElement("div");
  root.appendChild(link_foot);
  link_foot.innerHTML = /* html */ `
<a is='spa-anchor' href='?id=4802-4815'>朱洛星</a>
<a is='spa-anchor' href='?lv=680&grade=DX&rank=U'>賭博師</a>
<a is='spa-anchor' href='?id=3626-3639,5651-5653,6403-6404,6939'>伝説</a>
<a is='spa-anchor' href='?q=インフィニティ.*%27'>IFULT</a>
/
<a is='spa-anchor' href='?id=10212-10241'>秘密D</a>
<a is='spa-anchor' href='?id=10362-10366'>混沌指</a>
<a is='spa-anchor' href='?id=11351-11361'>ヤティカヌ</a>
<a is='spa-anchor' href='?id=11445-11468'>閃の軌跡</a>
<a is='spa-anchor' href='?id=10242-10261'>デザコン2019</a>
<a is='spa-anchor' href='?id=11741-11746'>デザコン2021</a>
<a is='spa-anchor' href='?id=12344-12349'>デザコン2022</a>
/
<a is='spa-anchor' href='?id=12257-12298'>新協会武器</a>
<a is='spa-anchor' href='?id=12299-12305'>新協会補助</a>
<a is='spa-anchor' href='?id=12306-12324'>新協会防具</a>
`;
  app.appendChild(root);
};

type IndexItem = {
  href: string;
  icon: string;
  text: string;
};
type IndexToc = {
  label?: string;
  content: (number | IndexItem | IndexToc)[];
};

const toc: IndexToc = {
  content: [
    {
      label: "武器",
      content: [
        {
          label: "剣士・戦士",
          content: [
            {
              href: "?group=w&job=0",
              icon: "img/item/1187.png",
              text: "片手剣",
            },
            { href: "?type=19&job=0", icon: "img/item/431.png", text: "盾" },
            20,
            71,
          ],
        },
        {
          label: "ランサー・アーチャー",
          content: [26, 27, 28, 3, 13],
        },
        {
          label: "ウィザード・ウルフマン",
          content: [
            21,
            12,
            22,
            74,
            {
              href: "?group=mw&job=3",
              icon: "img/item/1019.png",
              text: "爪",
            },
          ],
        },
        {
          label: "ビショップ・追放天使",
          content: [
            23,
            { href: "?type=19&job=4", icon: "img/item/428.png", text: "盾" },
            24,
            15,
          ],
        },
        {
          label: "ビーストテイマー・サマナー",
          content: [29, 14],
        },
        {
          label: "シーフ・武道家",
          content: [
            25,
            72,
            70,
            73,
            {
              href: "?group=mw&job=7",
              icon: "img/item/3007.png",
              text: "手足",
            },
          ],
        },
        {
          label: "プリンセス・リトルウィッチ",
          content: [
            30,
            31,
            {
              href: "?group=w&job=13",
              icon: "img/item/518.png",
              text: "ワンド/メイス",
            },
            75,
          ],
        },
        {
          label: "ネクロマンサー・悪魔",
          content: [
            33,
            15,
            {
              href: "?group=w&job=14",
              icon: "img/item/421.png",
              text: "ネクロ武器",
            },
            {
              href: "?type=31&job=14",
              icon: "img/item/510.png",
              text: "ネクロ補助",
            },
          ],
        },
        {
          label: "霊術師・闘士",
          content: [54, 76, 55, 77],
        },
        {
          label: "光奏師・獣人",
          content: [56, 58, 12],
        },
        {
          label: "メイド・黒魔術師",
          content: [
            57,
            78,
            61,
            {
              href: "?type=15&job=21",
              icon: "img/item/848.png",
              text: "十字架",
            },
          ],
        },
        {
          label: "マスケッティア・アルケミスト",
          content: [63, 64, 68, 69],
        },
        {
          label: "キャプテン",
          content: [80, 81],
        },
      ],
    },
    {
      label: "防具",
      content: [8, 0, 1, 11, 10, 6, 2, 4, 5, 16, 17, 7, 9],
    },
    {
      label: "その他",
      content: [
        34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
        52, 59, 60, 65, 66, 67,
      ],
    },
  ],
};

const buildToc = (toc: IndexToc): HTMLDivElement => {
  const frag = document.createElement("div");
  frag.className = "index-frame";
  if (toc.label) {
    const head = document.createElement("h2");
    head.innerText = toc.label;
    frag.appendChild(head);
  }
  for (const i of toc.content) {
    if (typeof i === "number") {
      const cell = document.createElement("div");
      cell.className = "index-image";
      cell.innerHTML = /* html */ `<a is='spa-anchor' href='?type=${i}'><img src='img/type/${i}.png' width="34" height="34" /><br />${C.item_type[i]}</a>`;
      frag.appendChild(cell);
    } else if ("href" in i) {
      const cell = document.createElement("div");
      cell.className = "index-image";
      cell.innerHTML = /* html */ `<a is='spa-anchor' href='${i.href}'><img src='${i.icon}' width="34" height="34" /><br />${i.text}</a>`;
      frag.appendChild(cell);
    } else if ("content" in i) {
      frag.appendChild(buildToc(i));
    }
  }

  return frag;
};
