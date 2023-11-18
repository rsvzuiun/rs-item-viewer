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
    name: "IF",
    query: "ADEGR&q=インフィニティ",
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
    name: "B&I",
    query: "ADEGR&q=%5E%28ブレイブ%7Cロウバスト%7Cインテリ%29",
  },
  {
    name: "C&S",
    query: "ADEGR&q=%5E%28クロウ%7Cシャイエン%29",
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
    query: "ADEGR&lv=1250&grade=UM&rank=U",
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
    name: "片手剣",
    query: "type=18",
    img: [
      181, 1117, 421, 1200, 982, 2986, 3319, 2513, 3558, 3664, 4120, 4472, 2984,
    ],
  },
  {
    name: "両手剣",
    query: "type=20",
    img: [
      201, 1118, 439, 1225, 983, 2982, 3322, 2810, 3555, 3666, 4137, 4494, 2985,
    ],
  },
  {
    name: "槍",
    query: "type=28",
    img: [
      253, 1123, 489, 1330, 988, 3013, 3326, 3211, 3582, 3671, 4141, 4467, 2992,
    ],
  },
  {
    name: "弓",
    query: "type=26",
    img: [
      240, 1124, 475, 1306, 989, 3004, 3323, 2512, 3560, 3669, 4139, 4465, 3010,
    ],
  },
  {
    name: "杖",
    query: "type=21",
    img: [
      209, 1119, 444, 1244, 984, 2991, 3327, 2768, 3569, 3676, 4142, 4499, 2997,
    ],
  },
  {
    name: "牙",
    query: "type=22",
    img: [
      214, 1120, 448, 1253, 985, 2999, 3330, 2770, 3549, 3678, 4100, 4500, 2973,
    ],
  },
  {
    name: "メイス",
    query: "type=23",
    img: [
      218, 1121, 451, 1260, 986, 3015, 3333, 2771, 3571, 3682, 4104, 4502, 2998,
    ],
  },
  {
    name: "翼",
    query: "type=24",
    img: [
      227, 1122, 459, 1277, 987, 3006, 3336, 2812, 3572, 3684, 4107, 4464, 2993,
    ],
  },
  {
    name: "笛",
    query: "type=29",
    img: [
      266, 1125, 502, 1357, 990, 2977, 3332, 2525, 3565, 3680, 4102, 4469, 2989,
    ],
  },
  {
    name: "短剣",
    query: "type=25",
    img: [
      232, 1126, 465, 1292, 991, 2981, 3337, 1298, 3561, 3686, 4108, 4471, 2979,
    ],
  },
  {
    name: "爪手足",
    query: "group=mw",
    img: [107, -1, 340, -1, 1497, 3007, 3339, 2772, 3562, 3640, 4135, -1, 3003],
  },
  {
    name: "格闘武器",
    query: "type=70",
    img: [3280, -1, 3275, -1, -1, -1, -1, -1, -1, 3663, -1, 4474, 3663],
  },
  {
    name: "スリング",
    query: "type=30",
    img: [
      272, 1127, 506, 1373, 992, 3016, 3342, 2862, 3563, 3672, 4111, 4478, 3012,
    ],
  },
  {
    name: "ワンド",
    query: "type=32",
    img: [
      283, 1128, 518, 1393, 993, 2987, 3343, 2585, 3564, 3674, 4113, 4480, 2994,
    ],
  },
  {
    name: "鞭",
    query: "type=33",
    img: [
      288, 1129, 520, 1399, 994, 2976, 3346, 2526, 3566, 3698, 4115, 4476, 2978,
    ],
  },
  {
    name: "鎌",
    query: "type=54",
    img: [
      1514, 1963, 1567, 1549, 1819, 2972, 3347, 2861, 3575, 3688, 4117, 4481,
      2995,
    ],
  },
  {
    name: "クロー",
    query: "type=55",
    img: [
      1647, 1968, 1799, 1807, 1670, 3005, 3349, 2651, 3577, 3690, 4119, 4484,
      3000,
    ],
  },
  {
    name: "本",
    query: "type=56",
    img: [
      1730, 1973, 1747, 1742, 1960, 3001, 3352, 2584, 3551, 3692, 4122, 4486,
      3009,
    ],
  },
  {
    name: "双剣",
    query: "type=58",
    img: [
      2056, 2055, 2093, 2090, 2097, 3014, 3354, 2767, 3552, 3694, 4124, 4488,
      2975,
    ],
  },
  {
    name: "ほうき",
    query: "type=57",
    img: [
      2026, 2032, 1987, 2009, 2011, 2996, 3356, 2524, 3547, 3699, 4126, 4490,
      2983,
    ],
  },
  {
    name: "ダークコア",
    query: "type=61",
    img: [
      2184, 2183, 2215, 2222, 2227, 2990, 3358, 2811, 3567, 3701, 4128, 4491,
      3002,
    ],
  },
  {
    name: "双拳銃",
    query: "type=63",
    img: [
      2675, 2688, 2735, -1, 2740, 3011, 3359, 2860, 3578, 3703, 4130, 4492,
      3008,
    ],
  },
  {
    name: "錬金石",
    query: "type=68",
    img: [
      3058, 3087, 3040, -1, 3090, 3046, 3361, 3217, 3579, 3705, 4134, 4493,
      3041,
    ],
  },
  {
    name: "チェインアンカー",
    query: "type=80",
    img: [
      4088, -1, 4216, -1, 4223, 4213, 4211, 4218, 4220, 4217, 4227, 4495, 4214,
    ],
  },
];

const row_header = () => {
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  thead.appendChild(tr);
  tr.appendChild(document.createElement("th"));
  tr.innerHTML = header.reduce(
    (a, e) =>
      /* html */ `${a}<th><a is="spa-anchor" href="?group=w&${
        e.query
      }">${e.name.replace(/&/g, "&amp;")}</a></th>`,
    "<th></th>"
  );
  return thead;
};

const table = cache(() => {
  const table = document.createElement("table");
  table.className = "sticky_table";
  table.innerHTML += /* html */ `<caption style="font-size: 2em">武器一覧</caption>`;
  table.appendChild(row_header());
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  for (let i = 0; i < body.length; i++) {
    // if (i % 6 == 0) tbody.appendChild(row_header());
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
  // tbody.appendChild(row_header());
  return table;
});

export const weapon = (app: HTMLElement) => {
  const root = document.createElement("div");
  root.appendChild(table());
  app.appendChild(root);
};
