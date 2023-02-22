import { Tuple } from "../types";
import { cache } from "../util";

const header = [
  {
    name: "N",
    query: "ADEGR&rank=N&nq=^Rank",
  },
  {
    name: "EX",
    query: "ADEGR&rank=N&q=Rank",
  },
  {
    name: "U",
    query: "ADEGR&rank=U",
  },
  {
    name: "決戦",
    query: "q=%5C%5BD%5C%5D",
  },
  {
    name: "BFU",
    query: "ADEGR&id=8285-8301",
  },
  {
    name: "遺物",
    query: "ADEGR&q=%5C%5B遺物%5C%5D",
  },
  {
    name: "775",
    query: "ADEGR&lv=775&grade=UM&rank=U&id=9122-",
  },
  {
    name: "800",
    query: "ADEGR&lv=800&grade=DX&rank=U",
  },
  {
    name: "1000",
    query: "ADEGR&lv=1000&grade=UM&rank=U",
  },
  {
    name: "1100",
    query: "ADEGR&lv=1100&grade=DX&rank=U",
  },
  {
    name: "1250",
    query: "ADEGR&lv=1250&grade=UM&rank=U&id=12818-",
  },
  {
    name: "特殊",
    query: "ADEGR&lv=0",
  },
  {
    name: "775~",
    query: "ADEGR&lv=775-&rank=U&id=9122-",
  },
] as const satisfies readonly { name: string; query: string }[];

type Body = {
  name: string;
  query: string;
  img: Tuple<number, typeof header.length>;
}[];

const body: Body = [
  {
    name: "ネックレス",
    query: "type=8",
    img: [
      128, -1, 1051, 1052, 2633, 2633, 2949, 3368, 3650, 4154, 4523, 1492, 2967,
    ],
  },
  {
    name: "ヘルメット",
    query: "type=0",
    img: [
      89, -1, 325, 999, 2647, 2647, 2954, 3389, 3635, 4146, 4534, 1492, 3390,
    ],
  },
  {
    name: "冠",
    query: "type=1",
    img: [
      96, -1, 1007, 1004, 2648, 2648, 2962, 3387, 3637, 4147, 4519, 1492, 3388,
    ],
  },
  {
    name: "イヤリング",
    query: "type=10",
    img: [
      146, -1, 1067, 1066, 2640, 2640, 2963, 3371, 3652, 4158, 4521, 1492, 2971,
    ],
  },
  {
    name: "マント",
    query: "type=11",
    img: [
      152, -1, 387, 1070, 2638, 2638, 2952, 3383, 3657, 4161, 4522, 1492, 2966,
    ],
  },
  {
    name: "ベルト",
    query: "type=6",
    img: [
      116, -1, 351, 352, 2643, 2643, 2947, 3392, 3645, 4148, 4526, 1492, 2959,
    ],
  },
  {
    name: "グローブ",
    query: "type=2&group=p",
    img: [
      100, 1132, 331, 1015, 2645, 2645, 2961, 3380, 3639, 4144, 4529, 1492,
      2948,
    ],
  },
  {
    name: "ブレスレット",
    query: "type=5",
    img: [110, -1, 1024, -1, -1, -1, -1, -1, 3641, 4143, 4532, 1492, 4531],
  },
  {
    name: "投擲機",
    query: "type=3",
    img: [106, -1, 337, 1017, -1, -1, -1, -1, -1, -1, -1, 1492, -1],
  },
  {
    name: "共用鎧",
    query: "type=16",
    img: [
      157, 1133, 393, 1076, 2649, 2649, 2945, 3363, 3659, 4153, 4518, 1492,
      2969,
    ],
  },
  {
    name: "専用鎧",
    query: "type=17",
    img: [174, -1, 405, 1094, -1, -1, 2970, -1, 4172, -1, -1, -1, 4183],
  },
  {
    name: "ブーツ",
    query: "type=7&group=p",
    img: [
      122, -1, 358, 1037, 2636, 2636, 2951, 3376, 3647, 4151, 4527, 1492, 2958,
    ],
  },
  {
    name: "リング",
    query: "type=9",
    img: [138, -1, 374, 1061, -1, -1, -1, 3395, -1, -1, -1, 1492, 3396],
  },
  {
    name: "盾",
    query: "type=19",
    img: [194, -1, 431, 1218, -1, -1, -1, -1, -1, -1, -1, 4574, -1],
  },
  {
    name: "鞘",
    query: "type=71",
    img: [3772, -1, 3775, -1, -1, -1, -1, -1, -1, -1, -1, 4557, -1],
  },
  {
    name: "矢",
    query: "type=27",
    img: [245, -1, 480, 1324, -1, -1, -1, -1, -1, -1, -1, 4575, -1],
  },
  {
    name: "腕刺青",
    query: "type=13",
    img: [674, -1, -1, 676, -1, -1, -1, -1, -1, -1, -1, 4558, -1],
  },
  {
    name: "ブローチ",
    query: "type=12",
    img: [649, -1, -1, 651, -1, -1, -1, -1, -1, -1, -1, 4567, -1],
  },
  {
    name: "獣毛装飾",
    query: "type=74",
    img: [3814, -1, 3817, -1, -1, -1, -1, -1, -1, -1, -1, 4568, -1],
  },
  {
    name: "十字架",
    query: "type=15",
    img: [739, -1, -1, 741, -1, -1, -1, -1, -1, -1, -1, 4572, -1],
  },
  {
    name: "肩刺青",
    query: "type=14",
    img: [699, -1, -1, 701, -1, -1, -1, -1, -1, -1, -1, 4578, -1],
  },
  {
    name: "マスターキー",
    query: "type=72",
    img: [3784, -1, 3788, -1, -1, -1, -1, -1, -1, -1, -1, 4577, -1],
  },
  {
    name: "保護帯",
    query: "type=73",
    img: [3798, -1, 3802, -1, -1, -1, -1, -1, -1, -1, -1, 4581, -1],
  },
  {
    name: "スリング弾丸",
    query: "type=31",
    img: [277, -1, 513, 1380, -1, -1, -1, -1, -1, -1, -1, 4576, -1],
  },
  {
    name: "星群",
    query: "type=75",
    img: [3792, -1, 3795, -1, -1, -1, -1, -1, -1, -1, -1, 4571, -1],
  },
  {
    name: "契約霊",
    query: "type=76",
    img: [3778, -1, 3781, -1, -1, -1, -1, -1, -1, -1, -1, 4556, -1],
  },
  {
    name: "ウォーペイント",
    query: "type=77",
    img: [3806, -1, 3808, -1, -1, -1, -1, -1, -1, -1, -1, 4570, -1],
  },
  {
    name: "コサージュ",
    query: "type=78",
    img: [3810, -1, 3812, -1, -1, -1, -1, -1, -1, -1, -1, 4569, -1],
  },
  {
    name: "魔弾石",
    query: "type=64",
    img: [2701, -1, 2709, -1, -1, -1, -1, -1, -1, -1, -1, 4580, -1],
  },
  {
    name: "触媒石",
    query: "type=69",
    img: [3062, -1, 3075, -1, -1, -1, -1, -1, -1, -1, -1, 4573, -1],
  },
  {
    name: "ラム酒",
    query: "type=81",
    img: [4097, -1, 4237, -1, -1, -1, -1, -1, -1, -1, -1, 4579, -1],
  },
];

const row_header = () => {
  const tr = document.createElement("tr");
  tr.appendChild(document.createElement("th"));
  tr.innerHTML = header.reduce(
    (a, e) =>
      /* html */ `${a}<th><a is="spa-anchor" href="?group=p&${
        e.query
      }">${e.name.replace(/&/g, "&amp;")}</a></th>`,
    "<th></th>"
  );
  return tr;
};

const table = cache(() => {
  const table = document.createElement("table");
  table.innerHTML += /* html */ `<caption style="font-size: 2em">防具一覧</caption>`;
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  for (let i = 0; i < body.length; i++) {
    if (i % 8 == 0) tbody.appendChild(row_header());
    const e = body[i];
    const tr = document.createElement("tr");
    tr.innerHTML = e.img.reduce(
      (a, imgid, idx) =>
        a +
        (imgid === -1
          ? /* html */ `<td>-</td>`
          : /* html */ `<td><a is="spa-anchor" href="?${header[idx].query}&${e.query}"><img src="img/item/${imgid}.png" width="34" height="34" /></td>`),
      /* html */ `<th><a is="spa-anchor" href="?${e.query}">${e.name}</a></th>`
    );
    tbody.appendChild(tr);
  }
  tbody.appendChild(row_header());
  return table;
});

export const protector = (app: HTMLElement) => {
  const root = document.createElement("div");
  root.appendChild(table());
  app.appendChild(root);
};
