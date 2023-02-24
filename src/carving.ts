import { Option } from "./types";

export const carving_ring: { [id: number]: Option[] } = {
  708: [
    // 混沌
    { Id: -1, Text: "ダブルクリティカルダメージ増加 +[0]％", Value: [1] },
    { Id: -1, Text: "魔法致命打確率増加 +[0]％", Value: [1] },
    {
      Id: -1,
      Text: "<c:GRAY>最終刻印効果 : 最終ダメージ増加 [0]％<n>",
      Value: [4],
    },
  ],
  709: [
    // 破壊
    { Id: -1, Text: "全ての能力値[0]増加", Value: [12] },
    { Id: -1, Text: "能力値低下防止[0]％", Value: [1] },
    { Id: -1, Text: "抵抗値低下防止[0]％", Value: [1] },
    {
      Id: -1,
      Text: "<c:GRAY>最終刻印効果 : 最終ダメージ増加 [0]％<n>",
      Value: [4],
    },
  ],
  710: [
    // 破滅
    { Id: -1, Text: "最大体力増加[0]％", Value: [2] },
    { Id: -1, Text: "防御力増加[0]％", Value: [2] },
    {
      Id: -1,
      Text: "<c:GRAY>最終刻印効果 : 最終ダメージ増加 [0]％<n>",
      Value: [4],
    },
  ],
  711: [
    // 滅亡
    { Id: -1, Text: "PVP物理攻撃力と魔法攻撃力増加 [0]％", Value: [1] },
    {
      Id: -1,
      Text: "<c:GRAY>最終刻印効果 : 最終ダメージ増加 [0]％<n>",
      Value: [4],
    },
  ],
  712: [
    // 災厄
    { Id: -1, Text: "ダメージ +[0]％", Value: [2] },
    { Id: -1, Text: "魔法ダメージ +[0]％", Value: [1] },
    {
      Id: -1,
      Text: "<c:GRAY>最終刻印効果 : 最終ダメージ増加 [0]％<n>",
      Value: [4],
    },
  ],
};

// {Id: -1, Text: '', Value: [0]},
export const carving: {
  [group: number]: {
    name: string;
    [id: number]: {
      name: string;
      op: Option[];
    };
  };
} = {
  1: {
    name: "ヤティカヌの刻印",
    1: {
      // 鋭い見張り人
      name: "野性",
      op: [
        { Id: 351, Value: [300] },
        { Id: 69, Value: [750] },
        { Id: 70, Value: [40] },
        { Id: 463, Value: [25] },
      ],
    },
    2: {
      // 狩りの巨匠
      name: "凶暴",
      op: [
        { Id: 66, Value: [2250] },
        { Id: 725, Value: [1050] },
        { Id: 727, Value: [11] },
        { Id: 755, Value: [30] },
      ],
    },
    3: {
      // エクリプスステップ
      name: "乱暴な",
      op: [
        { Id: 67, Value: [2250] },
        { Id: 460, Value: [80] },
        { Id: 462, Value: [11] },
      ],
    },
    4: {
      // ラストパイオニア
      name: "猛獣",
      op: [
        { Id: 352, Value: [300] },
        { Id: 460, Value: [80] },
        { Id: 70, Value: [25] },
        { Id: 623, Value: [32] },
      ],
    },
    5: {
      // 祭司長の礼服
      name: "爽快な",
      op: [
        { Id: 352, Value: [300] },
        { Id: 68, Value: [300] },
        { Id: 753, Value: [30] },
        { Id: 461, Value: [10] },
      ],
    },
    6: {
      // 共鳴する未知
      name: "涼しい",
      op: [
        { Id: 65, Value: [2250] },
        { Id: 63, Value: [1050] },
        { Id: 109, Value: [25] },
        { Id: 194, Value: [50] },
      ],
    },
    7: {
      // 燃え上がる意志
      name: "瞑想",
      op: [
        { Id: 65, Value: [1125] },
        { Id: 68, Value: [600] },
        { Id: 194, Value: [25] },
        { Id: 723, Value: [15] },
      ],
    },
    8: {
      // 先導者の足跡
      name: "そよ風",
      op: [
        { Id: 68, Value: [1125] },
        { Id: 302, Value: [41] },
        { Id: 753, Value: [25] },
        { Id: 732, Value: [30] },
      ],
    },
    9: {
      // 古代森の残影
      name: "根",
      op: [
        { Id: 66, Value: [2250] },
        { Id: 351, Value: [30] },
        { Id: 352, Value: [30] },
        { Id: 789, Value: [30] },
      ],
    },
    10: {
      // 古代森の庇護
      name: "茎",
      op: [
        { Id: 352, Value: [300] },
        { Id: 66, Value: [600] },
        { Id: 86, Value: [30] },
        { Id: 648, Value: [15] },
      ],
    },
    11: {
      // 古代森のささやき
      name: "葉",
      op: [
        { Id: 352, Value: [300] },
        { Id: 110, Value: [15] },
        { Id: 86, Value: [30] },
        { Id: 655, Value: [13] },
      ],
    },
  },
  2: {
    name: "閃の軌跡コラボ刻印",
    1: {
      name: "アヴァロンガーヴ",
      op: [
        { Id: 63, Value: [200] },
        { Id: 69, Value: [200] },
        { Id: 464, Value: [10] },
        { Id: 623, Value: [15] },
      ],
    },
    2: {
      name: "アドバンスジャケット",
      op: [
        { Id: 63, Value: [160] },
        { Id: 69, Value: [160] },
        { Id: 464, Value: [8] },
        { Id: 623, Value: [12] },
      ],
    },
    3: {
      name: "ヴァリアントコート",
      op: [
        { Id: 65, Value: [200] },
        { Id: 351, Value: [100] },
        { Id: 353, Value: [100] },
        { Id: 201, Value: [20] },
        { Id: 461, Value: [5] },
      ],
    },
    4: {
      name: "ジェネラルコート",
      op: [
        { Id: 65, Value: [160] },
        { Id: 351, Value: [80] },
        { Id: 353, Value: [80] },
        { Id: 201, Value: [16] },
        { Id: 461, Value: [4] },
      ],
    },
    5: {
      name: "ソルジャーグローブ",
      op: [
        { Id: 460, Value: [40] },
        { Id: 70, Value: [20] },
        { Id: 302, Value: [15] },
        { Id: 353, Value: [150] },
        { Id: 730, Value: [15] },
      ],
    },
    6: {
      name: "ライダーグローブ",
      op: [
        { Id: 460, Value: [32] },
        { Id: 70, Value: [16] },
        { Id: 302, Value: [12] },
        { Id: 353, Value: [120] },
        { Id: 730, Value: [12] },
      ],
    },
    7: {
      name: "ソーサラーグローブ",
      op: [
        { Id: 201, Value: [30] },
        { Id: 302, Value: [20] },
        { Id: 74, Value: [10] },
        { Id: 723, Value: [5] },
      ],
    },
    8: {
      name: "ドレスグローブ",
      op: [
        { Id: 201, Value: [25] },
        { Id: 302, Value: [16] },
        { Id: 74, Value: [8] },
        { Id: 723, Value: [4] },
      ],
    },
    9: {
      name: "ライトニングゴーグル",
      op: [
        { Id: 465, Value: [30] },
        { Id: 70, Value: [10] },
        { Id: 721, Value: [5] },
        { Id: 722, Value: [7] },
        { Id: 796, Value: [3, 1] },
      ],
    },
    10: {
      name: "パンツァーゴーグル",
      op: [
        { Id: 465, Value: [24] },
        { Id: 70, Value: [8] },
        { Id: 721, Value: [3] },
        { Id: 722, Value: [5] },
        { Id: 796, Value: [4, 1] },
      ],
    },
    11: {
      name: "ローゼンクラウン",
      op: [
        { Id: 201, Value: [20] },
        { Id: 78, Value: [20] },
        { Id: 194, Value: [20] },
        { Id: 799, Value: [3, 1] },
        { Id: 800, Value: [3, 1] },
      ],
    },
    12: {
      name: "覚醒ハチマキ",
      op: [
        { Id: 201, Value: [16] },
        { Id: 78, Value: [16] },
        { Id: 194, Value: [16] },
        { Id: 799, Value: [4, 1] },
        { Id: 800, Value: [4, 1] },
      ],
    },
    13: {
      name: "金剛黒帯",
      op: [
        { Id: 63, Value: [200] },
        { Id: 67, Value: [200] },
        { Id: 88, Value: [30] },
        { Id: 109, Value: [5] },
        { Id: 798, Value: [3, 1] },
      ],
    },
    14: {
      name: "真・闘魂ベルト",
      op: [
        { Id: 63, Value: [160] },
        { Id: 67, Value: [160] },
        { Id: 88, Value: [24] },
        { Id: 109, Value: [4] },
        { Id: 798, Value: [4, 1] },
      ],
    },
    15: {
      name: "ヴィクトリーベルト",
      op: [
        { Id: 65, Value: [200] },
        { Id: 64, Value: [200] },
        { Id: 789, Value: [20] },
        { Id: 798, Value: [3, 1] },
      ],
    },
    16: {
      name: "ひんやりベルト",
      op: [
        { Id: 65, Value: [160] },
        { Id: 64, Value: [160] },
        { Id: 789, Value: [16] },
        { Id: 798, Value: [3, 1] },
      ],
    },
    17: {
      name: "覇者のメダリオン",
      op: [
        { Id: 460, Value: [10] },
        { Id: 201, Value: [5] },
        { Id: 803, Value: [4] },
        { Id: 804, Value: [5, 1] },
        { Id: 724, Value: [5] },
      ],
    },
    18: {
      name: "パシオンルージュ",
      op: [
        { Id: 460, Value: [8] },
        { Id: 201, Value: [4] },
        { Id: 803, Value: [3] },
        { Id: 804, Value: [4, 1] },
        { Id: 724, Value: [4] },
      ],
    },
    19: {
      name: "グラールロケット",
      op: [
        { Id: 327, Value: [100] },
        { Id: 302, Value: [20] },
        { Id: 730, Value: [10] },
        { Id: 727, Value: [5] },
        { Id: 728, Value: [5] },
      ],
    },
    20: {
      name: "アビスシャドウ",
      op: [
        { Id: 327, Value: [80] },
        { Id: 302, Value: [16] },
        { Id: 730, Value: [8] },
        { Id: 727, Value: [3] },
        { Id: 728, Value: [4] },
      ],
    },
    21: {
      name: "ストレガーZ",
      op: [
        { Id: 87, Value: [80] },
        { Id: 302, Value: [30] },
        { Id: 460, Value: [60] },
        { Id: 70, Value: [15] },
        { Id: 462, Value: [5] },
      ],
    },
    22: {
      name: "ダマスカスブーツ",
      op: [
        { Id: 87, Value: [64] },
        { Id: 302, Value: [24] },
        { Id: 460, Value: [48] },
        { Id: 70, Value: [12] },
        { Id: 462, Value: [4] },
      ],
    },
    23: {
      name: "エンハンスブーツ",
      op: [
        { Id: 87, Value: [80] },
        { Id: 302, Value: [30] },
        { Id: 496, Value: [1, 4] },
        { Id: 496, Value: [3, 3] },
        { Id: 496, Value: [5, 2] },
      ],
    },
    24: {
      name: "アドバンスギア",
      op: [
        { Id: 87, Value: [64] },
        { Id: 302, Value: [24] },
        { Id: 496, Value: [1, 3] },
        { Id: 496, Value: [3, 2] },
        { Id: 496, Value: [5, 1] },
      ],
    },
  },
  3: {
    name: "日本16周年リング",
    1: {
      // 16th Anniversaryリング
      name: "満月",
      op: [
        { Id: 352, Value: [10] },
        { Id: 109, Value: [3] },
        { Id: 63, Value: [50] },
        { Id: 66, Value: [50] },
        { Id: 69, Value: [50] },
        { Id: 65, Value: [50] },
      ],
    },
  },
  4: {
    name: "日本17周年指輪",
    1: {
      // 17th Anniversaryリング
      name: "スターピース",
      op: [
        { Id: 352, Value: [10] },
        { Id: 109, Value: [3] },
        { Id: 74, Value: [30] },
        { Id: 64, Value: [75] },
        { Id: 67, Value: [75] },
        { Id: 68, Value: [50] },
      ],
    },
  },
  5: {
    name: "冬イベントリング",
    1: {
      // 真冬のリング
      name: "フリーズ",
      op: [
        { Id: 302, Value: [15] },
        { Id: 74, Value: [15] },
        { Id: 86, Value: [5] },
      ],
    },
  },
  6: {
    name: "19周年指輪刻印",
    1: {
      // 19周年指輪[攻撃]
      name: "攻撃",
      op: [
        { Id: 460, Value: [150] },
        { Id: 201, Value: [30] },
        { Id: 683, Value: [50] },
        { Id: 302, Value: [30] },
      ],
    },
    2: {
      // 19周年指輪[守護]
      name: "守護",
      op: [
        { Id: 86, Value: [10] },
        { Id: 351, Value: [40] },
        { Id: 352, Value: [20] },
        { Id: 302, Value: [30] },
      ],
    },
    3: {
      // 19周年指輪[特化]
      name: "特化",
      op: [
        { Id: 623, Value: [3] },
        { Id: 461, Value: [3] },
        { Id: 745, Value: [3] },
        { Id: 686, Value: [3] },
        { Id: 302, Value: [30] },
      ],
    },
  },
  7: {
    name: "日本18周年指輪",
    1: {
      // 18th Anniversaryリング
      name: "18th",
      op: [
        { Id: 352, Value: [10] },
        { Id: 109, Value: [3] },
        { Id: 74, Value: [30] },
        { Id: 63, Value: [75] },
        { Id: 66, Value: [50] },
        { Id: 65, Value: [75] },
      ],
    },
  },
};
