import { TextData } from "../types";
import * as C from "../const";

export const index = (app: HTMLElement, textdata: TextData) => {
  const root = document.createDocumentFragment();
  const form = document.createElement("form");
  root.appendChild(form);
  form.action = ".";
  form.method = "get";

  form.innerHTML = /* html */ `
<table>
<tr><td><label for="q">アイテム名*</label></td><td><input type="search" name="q" id="q" /></td></tr>
<tr><td><label for="keyword">説明文*</label></td><td><input type="search" name="keyword" id="keyword" /></td></tr>
<tr><td><label for="selecttype">部位</label></td><td><input type="search" id="selecttype" name="selecttype" list="selecttype-list" /><datalist id="selecttype-list"></datalist></td></tr>
<tr><td><label for="selectop">オプション</label></td><td><input type="search" id="selectop" name="selectop" list="selectop-list" /><datalist id="selectop-list"></datalist></td></tr>
<tr><td><label for="selectop">オプション(baseop)</label></td><td><input type="search" id="selectbaseop" name="selectbaseop" list="selectbaseop-list" /><datalist id="selectbaseop-list"></datalist></td></tr>
<tr><td><label for="selectjob">職業</label></td><td><input type="search" id="selectjob" name="selectjob" list="selectjob-list" /><datalist id="selectjob-list"></datalist></td></tr>
<tr><td></td><td>
<input type="radio" name="rank" id="rank-all" value="" checked="checked" /><label for="rank-all">全て</label>
<input type="radio" name="rank" id="rank-N" value="N" /><label for="rank-N">N</label>
<input type="radio" name="rank" id="rank-U" value="U" /><label for="rank-U"><img src="img/ui/type-icon-U.gif" alt="U" /></label>
<input type="radio" name="rank" id="rank-NX" value="NX" /><label for="rank-NX"><img src="img/ui/type-icon-NX.gif" alt="NX" /></label>
</td></tr>
<tr><td></td><td>
<input type="radio" name="grade" id="grade-all" value="" checked="checked" /><label for="grade-all">全て</label>
<input type="radio" name="grade" id="grade-N" value="N" /><label for="grade-N">N</label>
<input type="radio" name="grade" id="grade-DX" value="DX" /><label for="grade-DX"><img src="img/ui/type-icon-DX.gif" alt="DX" /></label>
<input type="radio" name="grade" id="grade-UM" value="UM" /><label for="grade-UM"><img src="img/ui/type-icon-UM.gif" alt="UM" /></label>

</td></tr>
<tr><td></td><td>
<input type="radio" name="group" id="group-all" value="" checked="checked" /><label for="group-all">全て</label>
<input type="radio" name="group" id="group-w" value="w" /><label for="group-w">武器</label>
<input type="radio" name="group" id="group-nw" value="nw" /><label for="group-nw">武器以外</label>
</td></tr>
<tr><td>除外設定</td><td>
<input type="checkbox" id="exclude-all">
(
<input type="checkbox" id="A" name="A" value="1" /><label for="A">[A]</label>
<input type="checkbox" id="D" name="D" value="1" /><label for="D">[D]</label>
<input type="checkbox" id="E" name="E" value="1" /><label for="E">[E]</label>
<input type="checkbox" id="G" name="G" value="1" /><label for="G">[G]</label>
<input type="checkbox" id="R" name="R" value="1" /><label for="R">[R]</label>
)
</td></tr>
<tr><td colspan="2"><button type="submit">検索</button> <button type="reset" onclick="storage.clear();">クリア</button></td></tr>
</table>
<p>* が付いてる項目は<a target="_blank" href="https://userweb.mnet.ne.jp/nakama/">正規表現</a>が使えます 例: <a is="spa-anchor" href="?q=%5Eフ.%2Bン%24">^フ.+ン$</a> <a is="spa-anchor" href="?q=ゲージング%7C辛苦">ゲージング|辛苦</a></p>
`;

  form
    .querySelector<HTMLInputElement>("#exclude-all")!
    .addEventListener("click", () => {
      const target = ["A", "D", "E", "G", "R"];
      const check =
        form.querySelector<HTMLInputElement>("#exclude-all")!.checked;
      for (const k of target) {
        form.querySelector<HTMLInputElement>(`#${k}`)!.checked = check;
      }
    });

  const selectoplist = form.querySelector("#selectop-list");
  if (selectoplist == null) throw new Error();
  for (const [k, v] of Object.entries(textdata.OptionBasic)) {
    if (typeof v === "undefined") continue;
    const option = document.createElement("option");
    option.value = `${k}: ${v
      .replace(/<c:([^> ]+?)>(.+?)<n>/g, "$2")
      .replace(/\$func\d+/g, "")}`;
    selectoplist.appendChild(option);
  }

  const selectbaseoplist = form.querySelector("#selectbaseop-list");
  if (selectbaseoplist == null) throw new Error();
  for (const [k, v] of Object.entries(textdata.OptionProper)) {
    if (typeof v === "undefined") continue;
    const option = document.createElement("option");
    option.value = `${k}: ${v
      .replace(/<c:([^> ]+?)>(.+?)<n>/g, "$2")
      .replace(/\$func\d+/g, "")}`;
    selectbaseoplist.appendChild(option);
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
  link.innerHTML = /* html */ `<span style="font-size: 1.5em"><a is="spa-anchor" href="?weapon">武器一覧</a> <a is="spa-anchor" href="?protector">防具一覧</a></span><br/>
<a is='spa-anchor' href='?id=4802-4815'>朱洛星</a>
<a is='spa-anchor' href='?lv=680&grade=DX&rank=U'>賭博師</a>
<a is='spa-anchor' href='?id=3626-3639,5651-5653,6403-6404,6939'>伝説</a>
<a is='spa-anchor' href='?q=インフィニティ.*%27'>IFULT</a>
<a is='spa-anchor' href='?q=%5E%5C%5B復帰者%5C%5D'>復帰者</a>
<br />
<a is='spa-anchor' href='?id=8940-8951'>Fate</a>
<a is='spa-anchor' href='?id=10212-10241'>秘密D</a>
<a is='spa-anchor' href='?id=10362-10366'>混沌指</a>
<a is='spa-anchor' href='?id=11351-11361'>ヤティカヌ</a>
<a is='spa-anchor' href='?id=11445-11468'>閃の軌跡</a>
<a is='spa-anchor' href='?id=10242-10261'>デザコン2019</a>
<a is='spa-anchor' href='?id=11741-11746'>デザコン2021</a>
<a is='spa-anchor' href='?id=12344-12349'>デザコン2022</a>
<br />協会装備:
<a is='spa-anchor' href='?id=12257-12298'>武器(I)</a>
<a is='spa-anchor' href='?id=12299-12305'>補助武器(I)</a>
<a is='spa-anchor' href='?id=12306-12324'>防具(I)</a>
/
<a is='spa-anchor' href='?q=%5C%5BR%5C%5D&group=w&lv=800'>武器(II)</a>
<a is='spa-anchor' href='?q=%5C%5BR%5C%5D&group=p&lv=800'>防具(II)</a>
/
<a is='spa-anchor' href='?q=%5C%5BR%5C%5D&group=w&lv=0'>武器(旧I)</a>
<a is='spa-anchor' href='?q=%5C%5BR%5C%5D&group=p&lv=0'>防具(旧I)</a>
`;

  root.appendChild(buildToc(toc));
  const link_foot = document.createElement("div");
  root.appendChild(link_foot);
  link_foot.innerHTML = /* html */ ``;
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
