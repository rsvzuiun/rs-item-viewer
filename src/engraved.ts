import { Option } from "./types"

export const engraved_ring: { [id: number]: Option[] } = {
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
}

// {Id: -1, Text: '', Value: [0]},
export const engraved: {
  [group: number]: {
    name: string
    [id: number]: {
      name: string
      op: Option[]
    }
  }
} = {
  1: {
    name: "ヤティカヌの刻印",
    1: {
      // 鋭い見張り人
      name: "野性",
      op: [
        { Id: -1, Text: "防御力 [0]％ 増加", Value: [300] },
        { Id: 6, Value: [750] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [40] },
        { Id: 184, Value: [25] },
      ],
    },
    2: {
      // 狩りの巨匠
      name: "凶暴",
      op: [
        { Id: 2, Value: [2250] },
        { Id: -1, Text: "最大体力 [0] 増加", Value: [1050] },
        { Id: 319, Value: [11] },
        { Id: -1, Text: "物理強打ダメージ [0]％ 増加", Value: [30] },
      ],
    },
    3: {
      // エクリプスステップ
      name: "乱暴な",
      op: [
        { Id: 1, Value: [2250] },
        { Id: 21, Value: [80] },
        { Id: -1, Text: "物理強打発動確率 [0]％ 増加", Value: [11] },
      ],
    },
    4: {
      // ラストパイオニア
      name: "猛獣",
      op: [
        { Id: -1, Text: "最大HP [0]％ 増加", Value: [300] },
        { Id: 21, Value: [80] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [25] },
        { Id: -1, Text: "敵物理致命打抵抗 [0]％減少", Value: [32] },
      ],
    },
    5: {
      // 祭司長の礼服
      name: "爽快な",
      op: [
        { Id: -1, Text: "最大HP [0]％ 増加", Value: [300] },
        { Id: 5, Value: [300] },
        { Id: 753, Value: [30] },
        { Id: -1, Text: "魔法致命打発動確率 [0]％ 増加", Value: [10] },
      ],
    },
    6: {
      // 共鳴する未知
      name: "涼しい",
      op: [
        { Id: 4, Value: [2250] },
        { Id: 0, Value: [1050] },
        { Id: -1, Text: "全てのスキルレベル [0] 増加", Value: [25] },
        { Id: 138, Value: [50] },
      ],
    },
    7: {
      // 燃え上がる意志
      name: "瞑想",
      op: [
        { Id: 4, Value: [1125] },
        { Id: 5, Value: [600] },
        { Id: 138, Value: [25] },
        { Id: -1, Text: "魔法強打発動確率 [0]％ 増加", Value: [15] },
      ],
    },
    8: {
      // 先導者の足跡
      name: "そよ風",
      op: [
        { Id: 5, Value: [1125] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [41] },
        { Id: 753, Value: [25] },
        { Id: -1, Text: "全ての属性ダメージ [0]％ 増加", Value: [30] },
      ],
    },
    9: {
      // 古代森の残影
      name: "根",
      op: [
        { Id: 2, Value: [2250] },
        { Id: -1, Text: "防御力 [0]％ 増加", Value: [30] },
        { Id: -1, Text: "最大HP [0]％ 増加", Value: [30] },
        { Id: 81, Value: [30] },
      ],
    },
    10: {
      // 古代森の庇護
      name: "茎",
      op: [
        { Id: -1, Text: "最大HP [0]％ 増加", Value: [300] },
        { Id: 2, Value: [600] },
        { Id: -1, Text: "全ての属性抵抗 [0]％ 増加", Value: [30] },
        { Id: -1, Text: "魔法クリティカル抵抗 [0]％ 増加", Value: [15] },
      ],
    },
    11: {
      // 古代森のささやき
      name: "葉",
      op: [
        { Id: -1, Text: "最大HP [0]％ 増加", Value: [300] },
        { Id: -1, Text: "物理回避率 [0]％ 増加", Value: [15] },
        { Id: -1, Text: "全ての属性抵抗 [0]％ 増加", Value: [30] },
        { Id: 655, Value: [13] },
      ],
    },
  },
  2: {
    name: "閃の軌跡コラボ刻印",
    1: {
      name: "アヴァロンガーヴ",
      op: [
        { Id: 0, Value: [200] },
        { Id: 6, Value: [200] },
        { Id: 182, Value: [10] },
        { Id: -1, Text: "敵物理致命打抵抗 [0]％減少", Value: [15] },
      ],
    },
    2: {
      name: "アドバンスジャケット",
      op: [
        { Id: 0, Value: [160] },
        { Id: 6, Value: [160] },
        { Id: 182, Value: [8] },
        { Id: -1, Text: "敵物理致命打抵抗 [0]％減少", Value: [12] },
      ],
    },
    3: {
      name: "ヴァリアントコート",
      op: [
        { Id: 4, Value: [200] },
        { Id: -1, Text: "防御力 [0]％ 増加", Value: [100] },
        { Id: -1, Text: "最大CP [0]％ 増加", Value: [100] },
        { Id: 145, Value: [20] },
        { Id: -1, Text: "魔法致命打発動確率 [0]％ 増加", Value: [5] },
      ],
    },
    4: {
      name: "ジェネラルコート",
      op: [
        { Id: 4, Value: [160] },
        { Id: -1, Text: "防御力 [0]％ 増加", Value: [80] },
        { Id: -1, Text: "最大CP [0]％ 増加", Value: [80] },
        { Id: 145, Value: [16] },
        { Id: -1, Text: "魔法致命打発動確率 [0]％ 増加", Value: [4] },
      ],
    },
    5: {
      name: "ソルジャーグローブ",
      op: [
        { Id: 21, Value: [40] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [20] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [15] },
        { Id: -1, Text: "最大CP [0]％ 増加", Value: [150] },
        { Id: -1, Text: "CP獲得ボーナス [0]％ 増加", Value: [15] },
      ],
    },
    6: {
      name: "ライダーグローブ",
      op: [
        { Id: 21, Value: [32] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [16] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [12] },
        { Id: -1, Text: "最大CP [0]％ 増加", Value: [120] },
        { Id: -1, Text: "CP獲得ボーナス [0]％ 増加", Value: [12] },
      ],
    },
    7: {
      name: "ソーサラーグローブ",
      op: [
        { Id: 145, Value: [30] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [20] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [10] },
        { Id: -1, Text: "魔法強打発動確率 [0]％ 増加", Value: [5] },
      ],
    },
    8: {
      name: "ドレスグローブ",
      op: [
        { Id: 145, Value: [25] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [16] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [8] },
        { Id: -1, Text: "魔法強打発動確率 [0]％ 増加", Value: [4] },
      ],
    },
    9: {
      name: "ライトニングゴーグル",
      op: [
        { Id: 185, Value: [30] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [10] },
        { Id: -1, Text: "武器最小攻撃力 [0] 増加", Value: [5] },
        { Id: -1, Text: "武器最大攻撃力 [0] 増加", Value: [7] },
        { Id: 14, Value: [3, 1] },
      ],
    },
    10: {
      name: "パンツァーゴーグル",
      op: [
        { Id: 185, Value: [24] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [8] },
        { Id: -1, Text: "武器最小攻撃力 [0] 増加", Value: [3] },
        { Id: -1, Text: "武器最大攻撃力 [0] 増加", Value: [5] },
        { Id: 14, Value: [4, 1] },
      ],
    },
    11: {
      name: "ローゼンクラウン",
      op: [
        { Id: 145, Value: [20] },
        { Id: 94, Value: [20] },
        { Id: 138, Value: [20] },
        { Id: 17, Value: [3, 1] },
        { Id: 18, Value: [3, 1] },
      ],
    },
    12: {
      name: "覚醒ハチマキ",
      op: [
        { Id: 145, Value: [16] },
        { Id: 94, Value: [16] },
        { Id: 138, Value: [16] },
        { Id: 17, Value: [4, 1] },
        { Id: 18, Value: [4, 1] },
      ],
    },
    13: {
      name: "金剛黒帯",
      op: [
        { Id: 0, Value: [200] },
        { Id: 1, Value: [200] },
        { Id: 96, Value: [30] },
        { Id: -1, Text: "全てのスキルレベル [0] 増加", Value: [5] },
        { Id: 16, Value: [3, 1] },
      ],
    },
    14: {
      name: "真・闘魂ベルト",
      op: [
        { Id: 0, Value: [160] },
        { Id: 1, Value: [160] },
        { Id: 96, Value: [24] },
        { Id: -1, Text: "全てのスキルレベル [0] 増加", Value: [4] },
        { Id: 16, Value: [4, 1] },
      ],
    },
    15: {
      name: "ヴィクトリーベルト",
      op: [
        { Id: 4, Value: [200] },
        { Id: 3, Value: [200] },
        { Id: 81, Value: [20] },
        { Id: 16, Value: [3, 1] },
      ],
    },
    16: {
      name: "ひんやりベルト",
      op: [
        { Id: 4, Value: [160] },
        { Id: 3, Value: [160] },
        { Id: 81, Value: [16] },
        { Id: 16, Value: [3, 1] },
      ],
    },
    17: {
      name: "覇者のメダリオン",
      op: [
        { Id: 21, Value: [10] },
        { Id: 145, Value: [5] },
        { Id: 50, Value: [4] },
        { Id: 284, Value: [5, 1] },
        { Id: -1, Text: "最終ダメージ [0]％ 増加", Value: [5] },
      ],
    },
    18: {
      name: "パシオンルージュ",
      op: [
        { Id: 21, Value: [8] },
        { Id: 145, Value: [4] },
        { Id: 50, Value: [3] },
        { Id: 284, Value: [4, 1] },
        { Id: -1, Text: "最終ダメージ [0]％ 増加", Value: [4] },
      ],
    },
    19: {
      name: "グラールロケット",
      op: [
        { Id: -1, Text: "すべてのステータス [0] 増加", Value: [100] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [20] },
        { Id: -1, Text: "CP獲得ボーナス [0]％ 増加", Value: [10] },
        { Id: 319, Value: [5] },
        { Id: 320, Value: [5] },
      ],
    },
    20: {
      name: "アビスシャドウ",
      op: [
        { Id: -1, Text: "すべてのステータス [0] 増加", Value: [80] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [16] },
        { Id: -1, Text: "CP獲得ボーナス [0]％ 増加", Value: [8] },
        { Id: 319, Value: [3] },
        { Id: 320, Value: [4] },
      ],
    },
    21: {
      name: "ストレガーZ",
      op: [
        { Id: 95, Value: [80] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [30] },
        { Id: 21, Value: [60] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [15] },
        { Id: -1, Text: "物理強打発動確率 [0]％ 増加", Value: [5] },
      ],
    },
    22: {
      name: "ダマスカスブーツ",
      op: [
        { Id: 95, Value: [64] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [24] },
        { Id: 21, Value: [48] },
        { Id: -1, Text: "物理致命打発動確率 [0]％ 増加", Value: [12] },
        { Id: -1, Text: "物理強打発動確率 [0]％ 増加", Value: [4] },
      ],
    },
    23: {
      name: "エンハンスブーツ",
      op: [
        { Id: 95, Value: [80] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [30] },
        { Id: 128, Value: [1, 4] },
        { Id: 128, Value: [3, 3] },
        { Id: 128, Value: [5, 2] },
      ],
    },
    24: {
      name: "アドバンスギア",
      op: [
        { Id: 95, Value: [64] },
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [24] },
        { Id: 128, Value: [1, 3] },
        { Id: 128, Value: [3, 2] },
        { Id: 128, Value: [5, 1] },
      ],
    },
  },
  3: {
    name: "日本16周年リング",
    1: {
      // 16th Anniversaryリング
      name: "満月",
      op: [
        { Id: -1, Text: "最大HP [0]％ 増加", Value: [10] },
        { Id: -1, Text: "全てのスキルレベル [0] 増加", Value: [3] },
        { Id: 0, Value: [50] },
        { Id: 2, Value: [50] },
        { Id: 6, Value: [50] },
        { Id: 4, Value: [50] },
      ],
    },
  },
  4: {
    name: "日本17周年指輪",
    1: {
      // 17th Anniversaryリング
      name: "スターピース",
      op: [
        { Id: -1, Text: "最大HP [0]％ 増加", Value: [10] },
        { Id: -1, Text: "全てのスキルレベル [0] 増加", Value: [3] },
        { Id: 41, Value: [30] },
        { Id: 3, Value: [75] },
        { Id: 1, Value: [75] },
        { Id: 5, Value: [50] },
      ],
    },
  },
  5: {
    name: "冬イベントリング",
    1: {
      // 真冬のリング
      name: "フリーズ",
      op: [
        { Id: -1, Text: "移動速度 [0]％ 増加", Value: [15] },
        { Id: -1, Text: "攻撃速度 [0]％ 増加", Value: [15] },
        { Id: 74, Value: [5] },
      ],
    },
  },
}
