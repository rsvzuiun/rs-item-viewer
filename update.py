# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "marimo[lsp,recommended,sandbox]>=0.19.0",
#     "numpy>=2.4.1",
#     "pillow>=12.1.0",
#     "polars>=1.37.1",
#     "pyzmq>=27.1.0",
#     "tqdm>=4.67.1",
# ]
# ///

import marimo

__generated_with = "0.19.4"
app = marimo.App(width="full")

with app.setup:
    import json
    import re
    import shutil
    import winreg
    from pathlib import Path
    from struct import calcsize, unpack_from
    from typing import Any

    import marimo as mo
    import numpy as np
    import numpy.typing as npt
    import polars as pl
    import polars.selectors as cs
    from PIL import Image
    from tqdm.auto import tqdm


@app.cell
def _():
    is_cli = mo.app_meta().mode == "script"
    return (is_cli,)


@app.cell
def _(RSPath, decode_item, is_cli):
    mo.stop(not is_cli)


    def cli_main() -> None:
        kr = mo.cli_args()["kr"] is not None
        DEST = Path(mo.cli_args()["dest"] or ".")  # type: ignore
        COLUMNS, _ = shutil.get_terminal_size()

        print(f"RS item viewer datagen {'kr' if kr else 'jp'}")

        if not kr:
            print("\n" + "=" * COLUMNS)
            fp_japan_llt = RSPath("Data/language/japan.llt")
            fp_itemname = DEST / "public/data/japan/item_name.json"
            fp_itemtext = DEST / "public/data/japan/item_text.json"
            fp_baseop = DEST / "public/data/japan/baseop.json"
            fp_op = DEST / "public/data/japan/op.json"
            fp_itemname.parent.mkdir(parents=True, exist_ok=True)
            print(f"{fp_japan_llt}")
            print(f"-> {fp_itemname}")
            print(f"-> {fp_itemtext}")
            print(f"-> {fp_baseop}")
            print(f"-> {fp_op}")
            df_japan_llt = decode_lang(fp_japan_llt)
            itemname = (
                df_japan_llt.filter(pl.col("i2") == 67).get_column("v").to_list()
            )
            itemtext = (
                df_japan_llt.filter(pl.col("i2") == 68).get_column("v").to_list()
            )
            # NOTE: https://github.com/pola-rs/polars/issues/19994
            # .select("i3", "v")
            # .rows_by_key("i3", unique=True)
            baseop = dict(
                df_japan_llt.filter(pl.col("i2") == 22)
                .select(k=pl.col("i3").cast(pl.String), v="v")
                .to_numpy()
            )
            op = dict(
                df_japan_llt.filter(pl.col("i2") == 23)
                .select(k=pl.col("i3").cast(pl.String), v="v")
                .to_numpy()
            )
            with open(fp_itemname, "w", encoding="utf-8") as f:
                json.dump(itemname, f, ensure_ascii=False, indent=2)
            with open(fp_itemtext, "w", encoding="utf-8") as f:
                json.dump(itemtext, f, ensure_ascii=False, indent=2)
            with open(fp_baseop, "w", encoding="utf-8") as f:
                json.dump(baseop, f, ensure_ascii=False, indent=2)
            with open(fp_op, "w", encoding="utf-8") as f:
                json.dump(op, f, ensure_ascii=False, indent=2)

        fp_item = RSPath("Data/Scenario/Red Stone/item.dat", kr=kr)
        assert fp_item.exists(), fp_item
        item_out = DEST / f"public/data/itemData{'-kr' if kr else ''}.json"
        item_out.parent.mkdir(parents=True, exist_ok=True)
        print("\n" + "=" * COLUMNS)
        print(f"{fp_item}")
        print(f"-> {item_out}")
        itemdata = (
            decode_item(fp_item)[0].pipe(transform_itemdata).pipe(prepare_dicts)
        )
        with open(item_out, "w", encoding="utf-8") as f:
            json.dump(itemdata, f, ensure_ascii=False, separators=(",", ":"))

        fp_iconitem = RSPath("Data/Misc/iconItem.smi", kr=kr)
        assert fp_iconitem.exists(), fp_iconitem
        icon_out = DEST / "public/img/item"
        icon_out.mkdir(parents=True, exist_ok=True)
        print("\n" + "=" * COLUMNS)
        print(f"{fp_iconitem}")
        print(f"-> {icon_out}")
        images = decode_smi(fp_iconitem)
        for i, img in tqdm(enumerate(images), total=len(images)):
            img.save(icon_out / f"{i}.png")

        print("\nDone")


    cli_main()
    return


@app.cell
def _():
    rs_dir_jp, _ = winreg.QueryValueEx(
        winreg.OpenKeyEx(
            winreg.HKEY_CURRENT_USER,
            R"Software\L&K Logic Korea\Red Stone for Japan",
        ),
        "Path",
    )

    rs_dir_kr, _ = winreg.QueryValueEx(
        winreg.OpenKeyEx(
            winreg.HKEY_CURRENT_USER, R"Software\L&K Logic Korea\Red Stone"
        ),
        "Path",
    )


    def RSPath(child: str, *, kr: bool = False) -> Path:
        if kr:
            return Path(rs_dir_kr) / Path(child)
        return Path(rs_dir_jp) / Path(child)
    return (RSPath,)


@app.function
def padding(origin: int, length: int) -> int:
    import math

    return math.ceil(origin / length) * length - origin


@app.function
def key_candidate(body: npt.NDArray[np.uint8]) -> pl.DataFrame:
    KEY_LENGTH = 326

    return (
        pl.DataFrame({"value": body})
        .select(pl.all().extend_constant(None, padding(len(body), KEY_LENGTH)))
        .with_row_index()
        .with_columns(pl.col("index") % KEY_LENGTH)
        .group_by("index", maintain_order=True)
        .agg(value=pl.col("value").value_counts(sort=True, normalize=True))
    )


@app.function
def keygen(
    body: npt.NDArray[np.uint8], rank: int = 1
) -> npt.NDArray[np.uint8]:
    return (
        key_candidate(body)
        .get_column("value")
        .list.get(rank - 1)
        .struct.field("value")
        .to_numpy()
    )


@app.function
def decrypt(
    raw: bytes, offset: int, *, hint: slice | None = None, rank: int = 1
) -> bytes:
    head = np.frombuffer(raw[:offset], dtype=np.uint8)
    body = np.frombuffer(raw[offset:], dtype=np.uint8)
    key = keygen(body[hint] if hint else body, rank)
    keys = np.resize(key, len(body))

    return np.concatenate([head, np.bitwise_xor(body, keys)]).tobytes()


@app.function
def str_conv(s: bytes) -> str:
    s = s.split(b"\x00", 1)[0]
    try:
        r = s.decode("cp932", errors="strict")
        if (
            re.search(r"[ｦ-ﾝ]", r) is None
            or "ﾊﾞ" in r
            or re.search(r"[あ-んア-ン]", r)
        ):
            return r

    except UnicodeError:
        pass
    try:
        r = s.replace(b"\xff", b"").decode("cp949", errors="strict")
        return r
    except UnicodeError:
        return repr(s)


@app.function
def decode_lang(fp: Path) -> pl.DataFrame:
    OFFSET = 0x10

    with open(fp, "rb") as f:
        raw = f.read()
    dec = decrypt(raw, OFFSET)
    del raw

    idx = OFFSET
    n0, _unknown = unpack_from("<2i", dec, idx)
    idx += calcsize("<2i")
    ar = []
    for i0 in range(n0):
        n1: int = unpack_from("<i", dec, idx)[0]
        idx += calcsize("<i")
        for i1 in range(n1):
            i2, n2, kind = unpack_from("<3i", dec, idx)
            idx += calcsize("<3i")

            if kind == 1:
                for i3 in range(2 * n2):
                    slen = unpack_from("<i", dec, idx)[0]
                    idx += calcsize("<i")
                    s = unpack_from(f"<{slen}s", dec, idx)[0]
                    idx += calcsize(f"<{slen}s")

                    ar.append(
                        {
                            "i0": i0,
                            "i1": i1,
                            "i2": i2,
                            "i3": i3,
                            "i4": i3 % 2,
                            "i5": 0,
                            "v": s,
                        }
                    )
            else:
                for _ in range(n2):
                    i3, i4, i5, slen = unpack_from("<4i", dec, idx)
                    idx += calcsize("<4i")
                    s = unpack_from(f"<{slen}s", dec, idx)[0]
                    idx += calcsize(f"<{slen}s")

                    ar.append(
                        {
                            "i0": i0,
                            "i1": i1,
                            "i2": i2,
                            "i3": i3,
                            "i4": i4,
                            "i5": i5,
                            "v": s,
                        }
                    )
    assert idx == len(dec)

    df = pl.DataFrame(ar).with_columns(
        pl.col("v").map_elements(str_conv, pl.String)
    )

    assert df.shape == df.unique(["i2", "i3", "i4", "i5"]).shape
    return df


@app.function
def explode(prefix: str, dtype: np.dtype, times: int):
    return tuple(
        (prefix.format(i) + name, *kind)
        for i in range(times)
        for name, *kind in dtype.descr
    )


@app.cell
def _():
    dt_header = np.dtype(
        [
            ("magic", "S60"),
            ("unknown0", "i4"),
            ("unknown1", "i4"),
            ("unknown2", "i4"),
            ("unknown3", "i4"),
            ("n_item", "i4"),
            ("nb_item", "i4"),
            ("unknown4", "i4"),
            ("unknown5", "S128"),
        ]
    )
    return (dt_header,)


@app.cell
def _():
    dt_baseop = np.dtype(
        [
            ("id", "i2"),
            *((f"val_{i}", "i2") for i in range(4)),
        ]
    )

    dt_option = np.dtype(
        [
            ("textid", "i2"),
            *((f"value{i}", "i2") for i in range(8)),
        ]
    )

    dt_longoption = np.dtype(
        [
            ("textid", "i2"),
            *((f"value{i}", "i4") for i in range(8)),
        ]
    )

    dt_item = np.dtype(
        [
            ("id", "i4"),
            ("name", "S68"),
            ("address_data", "u4"),  # 説明文へのポインタ
            ("type", "i4"),

            *((f"_null_0_{i}", "i2") for i in range(8)),
            ("price", "i4"),
            ("price_type", "i2"),  # [補正値]を出すのに使う
            ("attack_range", "i2"),
            ("attack_range_bonus", "i2"),
            ("attack_speed", "i2"),
            ("attack_min", "i2"),
            ("attack_max", "i2"),
            ("durability_model", "i2"),
            ("status_extra_mul", "i2"),
            ("status_extra_type", "i2"),
            ("status_extra_valueindex", "i2"),
            ("required_lv", "i2"),
            ("required_str", "i2"),
            ("required_agi", "i2"),
            ("required_con", "i2"),
            ("required_wiz", "i2"),
            ("required_int", "i2"),
            ("required_chs", "i2"),
            ("required_luc", "i2"),
            ("required_reserved", "i2"),
            ("item_image_id", "i2"),
            ("item_fieldimage_id", "i2"),
            ("equip_effect_number", "i2"),
            ("quest_id", "u2"),
            ("stack_size", "i2"),
            ("drop_lv", "i2"),
            # ---- base option
            ("no0_min", "i2"),
            ("no0_max", "i2"),
            ("no1_min", "i2"),
            ("no1_max", "i2"),
            *explode("baseop{0}_", dt_baseop, 4),
            # ---- base option
            *explode("option_{0}_", dt_option, 12),
            ("price_factor", "i2"),
            ("flags0_1", "u1"),
            ("flags0_2", "u1"),
            ("flags1_1", "u1"),  # 1-1
            ("flags1_2", "u1"),  # 1-2, == 1, isDX
            ("expiration_date_year", "i2"),
            ("expiration_date_month", "i2"),
            ("expiration_date_day", "i2"),
            ("expiration_date_hour", "i2"),
            ("unknown3_0", "u2"),
            ("unknown3_1", "u2"),
            ("unknown3_2", "u2"),
            ("equip_color_type", "i2"),
            ("constant_100", "i2"),
            ("drop_factor", "i2"),
            ("item_image_group", "i2"),
            ("rank_item_group", "i2"),
            ("PortalSphereGroup", "u2"),
            ("isPortalSpher", "u2"),
            ("unknown5_4", "u1"),  # 2-1 0, 1, 8, 9, 16, 32, 64, 128, ==128, isUM
            ("unknown5_5", "u1"),  # 2-2
            ("unknown5_6", "u1"),  # 2-3
            ("unknown5_7", "u1"),  # 2-4
            ("can_not_sell", "u2"),
            ("null_1", "u2"),
            ("portalGrade", "u2"),  # ポタのグレード？
            ("unknown5_14", "u1"),  # インフィニに関する何か
            ("unknown5_15", "u1"),  # 転生指輪などに関する何か
            ("unknown5_16", "u1"),  # 転生指輪などに関する何か
            ("unknown5_17", "u1"),  # 転生指輪などに関する何か
            ("unknown5_18", "u1"),  # インフィニに関する何か
            ("unknown5_19", "u1"),  # インフィニに関する何か
            ("jobflag_0", "u2"),  # 職業フラグ
            ("jobflag_1", "u4"),
            ("unknown5_26", "u1"),  # ifのなんか
            ("unknown5_27", "u1"),  # ifのなんか
            ("unknown5_28", "u1"),  # (0, 5, 10, 100) <- IFUP,スタイン家秘伝強化剤
            # 128, グロウポータル・スフィアー
            ("unknown5_29", "u1"),
            (
                "unknown5_30",
                "u1",
            ),  # (1,...,4)転生パワキ, (225,226,227)転生指制限? 他
            ("unknown5_31", "u1"),
            ("unknown5_32", "u1"),
            ("unknown5_33", "u1"),
            ("unknown5_34", "u1"),
            ("unknown5_35", "u1"),
            ("unknown5_36", "u1"),
            ("unknown5_37", "u1"),
            ("unknown5_38", "u1"),
            ("unknown5_39", "u1"),
            ("unknown5_40", "u1"),
            ("unknown5_41", "u1"),
            ("unknown5_42", "u1"),
            ("unknown5_43", "u1"),  # 植木鉢のなんか
            ("unknown5_44", "u1"),  # 植木鉢 + マファス・スフィアー
            ("unknown5_45", "u1"),  # 植木鉢のなんか
            ("unknown5_46", "u1"),  # 植木鉢,マファス,異界石,多次元の結晶
            ("unknown5_47", "u1"),  # 128:isNx, 64:isNxable
            ("unknown5_48", "u1"),  # ふいご,ミニペット変異
            ("unknown5_49", "u1"),  # |
            ("unknown5_50", "u1"),  # |
            ("unknown5_51", "u1"),  # |
            (
                "unknown5_52",
                "u1",
            ),  # ?錬成材、ライトドラグーン、異界石、マナ、多次元
            ("unknown5_53", "u1"),
            ("NxID", "u2"),
            ("unknown5_56", "u1"),  # 羅針盤
            ("unknown5_57", "u1"),  # 羅針盤
            ("unknown5_58", "u1"),  # 羅針盤
            ("unknown5_59", "u1"),  # 羅針盤
            ("unknown5_60", "u2"),  # 交換チケット
            ("unknown5_62", "u1"),
            ("unknown5_63", "u1"),  # コスチューム
            ("unknown5_64", "u1"),
            ("unknown5_65", "u1"),  # == 32 ユニーク分解不可
            ("unknown5_66", "u1"),
            ("unknown5_67", "u1"),
            ("unknown5_68", "u1"),
            ("unknown5_69", "u1"),
            ("unknown5_70", "u1"),
            ("unknown5_71", "u1"),
            ("unknown5_72", "u1"),
            ("unknown5_73", "u1"),
            ("unknown5_74", "u1"),
            ("unknown5_75", "u1"),
            ("unknown5_76", "u1"),
            ("unknown5_77", "u1"),
            ("unknown5_78", "u1"),
            ("unknown5_79", "u1"),
            ("unknown5_80", "u1"),
            ("unknown5_81", "u1"),
            ("unknown5_82", "u1"),
            ("unknown5_83", "u1"),
            ("item_grade", "u1"),  # NとかNxとか
            ("unknown6_0", "u1"),
            ("unknown6_1", "u1"),
            ("unknown6_2", "u1"),
            ("unknown6_3", "u1"),
            ("unknown6_4", "u1"),
            *explode("nxoption_{0}_", dt_option, 4),
            ("unknown7_0", "u1"),
            ("unknown7_1", "u1"),
            ("unknown7_2", "u1"),
            ("unknown7_3", "u1"),
            ("F0", "i4"),  # 枠外の引数
            ("F1", "i4"),
            ("F2", "i4"),
            ("F3", "i4"),
            ("unknown7_20", "u1"),
            ("unknown7_21", "u1"),
            ("unknown7_22", "u1"),
            ("unknown7_23", "u1"),
            ("unknown7_24", "u1"),
            ("unknown7_25", "u1"),
            ("unknown7_26", "u1"),
            ("unknown7_27", "u1"),
            ("unknown7_28", "u1"),
            ("unknown7_29", "u1"),  # 4: R?
            ("unknown7_30", "u1"),
            ("unknown7_31", "u1"),
            ("unknown7_32", "u1"),
            ("unknown7_33", "u1"),
            ("unknown7_34", "u1"),
            ("unknown7_35", "u1"),
            ("unknown7_36", "u1"),
            ("unknown7_37", "u1"),
            ("unknown7_38", "u1"),
            ("unknown7_39", "u1"),
            ("unknown7_40", "u1"),  # コスチューム等級 1, 2, 3, 5, 19
            ("unknown7_41", "u1"),
            ("unknown7_42", "u1"),
            ("unknown7_43", "u1"),
            ("unknown7_44", "u1"),
            ("unknown7_45", "u1"),
            ("unknown7_46", "u1"),  # ==200:[R]?, ==76: ディメンション?
            ("unknown7_47", "u1"),  # ==29:[R]?, ==44: ディメンション?
            (
                "is_longop",
                "i4",
            ),  # == 1 でオプション追記?上書き? 2022/04/27 kr UPDで役目終了
            *explode("long_nxoption_{0}_", dt_longoption, 4),
            *explode("long_option_{0}_", dt_longoption, 12),
            ("unknown8", "u2"),  # とりあえず
            ("unknown9", "u2"),  # とりあえず
            ("unknown10_0", "u1"),  # とりあえず
            ("unknown10_1", "u1"),  # とりあえず
            ("unknown10_2", "u1"),  # とりあえず
            ("unknown10_3", "u1"),  # とりあえず
            ("unknown11_0", "u1"),  # とりあえず
            ("unknown11_1", "u1"),  # とりあえず
            # ('description_length', c_int32),
            # ('description', c_char*description_length)
        ]
    )
    return (dt_item,)


@app.cell
def _():
    dt_prefix = np.dtype(
        [
            ("id", "i2"),
            ("sortid", "u2"),
            ("op_id", "i2"),
            ("n0_min", "i2"),
            ("n0_max", "i2"),
            ("n1_min", "i2"),
            ("n1_max", "i2"),
            ("n2", "i2"),
            ("text1", "S20"),
            ("text2", "S20"),
            ("level", "i2"),
            ("price0", "i2"),
            ("price1", "i4"),
            ("price2", "i2"),
            ("price3", "i2"),
            ("pos1", "i1"),
            ("pos2", "i1"),
            ("pos3", "i1"),
            ("null", "i1"),
            ("can_enchant", "11u1"),
            ("unknown_1", "i1"),
            ("unknown_2", "i1"),
            ("unknown_3", "i1"),
            ("unknown_4", "i1"),
            ("unknown_5", "i1"),
            ("unknown_6", "i1"),
            ("unknown_7", "i1"),
            ("unknown_8", "i1"),
            ("unknown_9", "i1"),
            ("unknown_10", "i1"),
            ("unknown_11", "i1"),
            ("unknown_12", "i1"),
            ("unknown_13", "i1"),
            ("unknown_14", "i1"),
            ("unknown_15", "i1"),
            ("unknown_16", "i1"),
            ("unknown_17", "i1"),
            ("unknown_18", "i1"),
            ("unknown_19", "i1"),
            ("unknown_20", "i1"),
            ("unknown_21", "i1"),
            ("unknown_22", "i1"),
            ("unknown_23", "i1"),
            ("unknown_24", "i1"),
            ("unknown_25", "i1"),
            ("unknown_26", "i1"),
            ("unknown_27", "i1"),
            ("unknown_28", "i1"),
            ("unknown_29", "i1"),
            ("unknown_30", "i1"),
            ("unknown_31", "i1"),
            ("unknown_32", "i1"),
            ("unknown_33", "i1"),
            # ----
            ("unknown_34", "i1"),
            ("unknown_35", "i1"),
            ("unknown_36", "i2"),
            ("addition_factor", "i2"),  # 付与係数
            ("unknown_40", "i1"),
            ("unknown_41", "i1"),
            ("unknown_42", "i2"),
            ("unknown_44", "i2"),
            ("n0_bias", "u4"),  # n0 add
            ("unknown_50", "i1"),
            ("unknown_51", "i1"),
            ("unknown_52", "i1"),
            ("unknown_53", "i1"),
            ("kind", "i4"),  # 1: set, 2: relic, 3: DX, 4: ULT, 5: NPC?, 6: NPC
            ("unknown_58", "i4"),
        ]
    )

    can_enchant_field = [
        "ヘルメット",
        "冠",
        "グローブ",
        "投擲機",
        "爪",
        "ブレスレット",
        "ベルト",
        "ブーツ",
        "ネックレス",
        "リング",
        "イヤリング",
        "マント",
        "ブローチ",
        "腕刺青",
        "肩刺青",
        "十字架",
        "共用鎧",
        "専用鎧",
        "片手剣",
        "盾",
        "両手剣",
        "杖",
        "牙",
        "メイス",
        "翼",
        "短剣",
        "弓",
        "矢",
        "槍",
        "笛",
        "スリング",
        "スリング弾丸",
        "ワンド",
        "鞭",
        "宝石",
        "_HP回復",
        "_CP回復",
        "_能力向上1",
        "_能力向上2",
        "_異常回復1",
        "_異常回復2",
        "_鍵",
        "_移動",
        "_必殺技",
        "_イベント1",
        "_ステータス上昇",
        "_魔力補充",
        "_セッティング宝石",
        "_イベント2",
        "_クエスト",
        "_課金",
        "_エンチャント・露店",
        "_BOX",
        "_null_0",
        "鎌",
        "爪武器",
        "本",
        "ほうき",
        "双剣",
        "_コスチューム",
        "_クレスト",
        "ダークコア",
        "_null_1",
        "双拳銃",
        "魔弾石",
        "_超越N",
        "_超越R",
        "_超越U",
        "錬金石",
        "触媒石",
        "格闘武器",
        "鞘",
        "マスターキー",
        "保護帯",
        "獣毛装飾",
        "星群",
        "契約霊",
        "ウォーペイント",
        "コサージュ",
        "_null_2",
        "チェインアンカー",
        "ラム酒",
        "大砲",  # きゃのにあ武器
        "エネルギーチャージャー",  # きゃのにあ補助
        "_null_5",
        "_null_6",
        "_null_7",
        "_null_8",
    ]
    return can_enchant_field, dt_prefix


@app.cell
def _(can_enchant_field, dt_header, dt_item, dt_prefix):
    def decode_item(fp: Path) -> tuple[pl.DataFrame, pl.DataFrame, int]:
        with open(fp, "rb") as f:
            raw = f.read()
        dec = decrypt(raw, 0x48, rank=2)
        del raw

        idx = 0x00

        header = np.rec.array(
            np.frombuffer(dec, dt_header, count=1, offset=idx)[0]
        )
        idx += dt_header.itemsize

        assert dt_item.itemsize == header.nb_item

        items = np.ndarray(header.n_item, dt_item)
        items_text = np.ndarray(header.n_item, object)

        for i in range(header.n_item):
            item = np.frombuffer(dec, dt_item, count=1, offset=idx)[0]
            idx += dt_item.itemsize

            slen: int = unpack_from("<i", dec, idx)[0]
            idx += calcsize("<i")
            text: bytes = unpack_from(f"<{slen}s", dec, idx)[0]
            idx += slen

            items[i], items_text[i] = item, text

        nb_prefix, n_prefix = unpack_from("<ii", dec, idx)
        idx += calcsize("<ii")

        assert dt_prefix.itemsize == nb_prefix

        prefixes = np.frombuffer(dec, dt_prefix, count=n_prefix, offset=idx)
        idx += n_prefix * dt_prefix.itemsize

        df_item = (
            pl.DataFrame(items)
            .with_columns(text=pl.Series(items_text))
            .with_columns(
                pl.col("name").map_elements(str_conv, pl.String),
                pl.col("text").map_elements(str_conv, pl.String),
            )
        )

        df_prefix = (
            pl.DataFrame(prefixes)
            .drop("can_enchant")
            .with_columns(
                pl.col("text1").map_elements(str_conv, pl.String),
                pl.col("text2").map_elements(str_conv, pl.String),
            )
            .join(
                pl.DataFrame(
                    np.unpackbits(
                        prefixes["can_enchant"],  # type: ignore
                        axis=1,
                        bitorder="little",
                    ),
                    can_enchant_field,
                ).with_row_index("id"),
                on="id",
                how="left",
            )
        )

        assert (
            df_prefix.select(cs.starts_with("_null")).sum().sum_horizontal().item()
            == 0
        )

        return df_item, df_prefix, idx
    return (decode_item,)


@app.function
def get_bits(n: int) -> list[int]:
    assert n >= 0
    return [i for i in range(n.bit_length()) if n & (1 << i)]


@app.function
def transform_itemdata(df: pl.DataFrame):
    MAGIC = 26

    return df.select(
        Id="id",
        ImageId="item_image_id",
        NxId=pl.when(pl.col("unknown5_47") & 64 > 0).then("NxID").otherwise(0),
        Type="type",
        Name="name",
        Rank=(
            pl.when(pl.col("unknown5_47") & 128 > 0)
            .then(pl.lit("NX"))
            .when(pl.col("item_grade") > 3)
            .then(pl.lit("U"))
            .otherwise(pl.lit("N"))
        ),
        Grade=(
            pl.when(pl.col("flags1_2") & 1 > 0)
            .then(pl.lit("DX"))
            .when(pl.col("unknown5_4") & 128 > 0)
            .then(pl.lit("UM"))
            .otherwise(pl.lit("N"))
        ),
        AtParam=pl.struct(
            Range="attack_range",
            Speed="attack_speed",
            Min="attack_min",
            Max="attack_max",
        ),
        ValueTable=pl.concat_list(
            pl.concat_arr("no0_min", "no0_max"),
            pl.concat_arr("no1_min", "no1_max"),
        ),
        OpPrt=(
            pl.concat_list(
                pl.struct(
                    Id=f"baseop{i}_id",
                    ValueIndex=pl.concat_arr(
                        f"baseop{i}_val_{n}" for n in range(4)
                    ),
                )
                for i in range(4)
            ).list.filter(pl.element().struct.field("Id") != -1)
        ),
        OpBit=(
            pl.concat_list(
                pl.struct(
                    Id=f"long_option_{i}_textid",
                    Value=pl.concat_arr(
                        f"long_option_{i}_value{n}" for n in range(8)
                    ),
                )
                for i in range(12)
            ).list.filter(pl.element().struct.field("Id") != -1)
        ),
        OpNxt=pl.when(pl.col("unknown5_47") & 128 > 0)
        .then(
            pl.concat_list(
                pl.struct(
                    Id=f"long_nxoption_{i}_textid",
                    Value=pl.concat_arr(
                        f"long_nxoption_{i}_value{n}" for n in range(8)
                    ),
                )
                for i in range(4)
            ).list.filter(pl.element().struct.field("Id") != -1)
        )
        .otherwise([]),
        Require=pl.struct(
            **{
                "0": pl.when(pl.col("required_lv") > 0).then("required_lv"),
                "1": pl.when(pl.col("required_str") > 0).then("required_str"),
                "2": pl.when(pl.col("required_agi") > 0).then("required_agi"),
                "3": pl.when(pl.col("required_con") > 0).then("required_con"),
                "4": pl.when(pl.col("required_wiz") > 0).then("required_wiz"),
                "5": pl.when(pl.col("required_int") > 0).then("required_int"),
                "6": pl.when(pl.col("required_chs") > 0).then("required_chs"),
                "7": pl.when(pl.col("required_luc") > 0).then("required_luc"),
                "Extra": (
                    pl.when(pl.col("status_extra_type") > 0)
                    .then(
                        pl.struct(
                            StatusType="status_extra_type",
                            MulValue="status_extra_mul",
                            ValueIndex="status_extra_valueindex",
                        )
                    )
                    .otherwise(pl.lit(None))
                ),
            }
        ),
        Job=(
            # 男性
            pl.when(pl.col("jobflag_0") & 0b00110000 == 0b00010000)
            .then(pl.lit([40]))
            # 女性
            .when(pl.col("jobflag_0") & 0b00110000 == 0b00100000)
            .then(pl.lit([41]))
            # 全て
            .when(
                (pl.col("jobflag_1") & (2**MAGIC - 1)).is_in(
                    [
                        *(2**i - 1 for i in range(22, 26 + 1)),
                        0b1111111111111110111111111,
                        0b1111101111111111111111111,
                    ]
                )
            )
            .then([])
            .otherwise(
                (pl.col("jobflag_1") & (2**MAGIC - 1)).map_elements(
                    get_bits, pl.List(pl.Int64)
                )
            )
        ),
        Text="text",
        StackSize="stack_size",
        Durability="durability_model",
        DropLv="drop_lv",
        DropFactor="drop_factor",
        Price="price",
        PriceType="price_type",
        PriceFactor="price_factor",
        Flags=pl.fold(
            pl.lit(""),
            lambda acc, x: acc + x,
            [
                pl.when(pl.col("flags0_2") & 1 << 0 > 0)
                .then(pl.lit("<使用不可>"))
                .otherwise(pl.lit("")),
                pl.when(pl.col("flags0_2") & 1 << 4 > 0)
                .then(pl.lit("<銀行取引不可>"))
                .otherwise(pl.lit("")),
                pl.when(pl.col("flags0_2") & 1 << 5 > 0)
                .then(pl.lit("<破壊不可>"))
                .otherwise(pl.lit("")),
                pl.when(pl.col("flags0_2") & 1 << 6 > 0)
                .then(pl.lit("<取引不可>"))
                .otherwise(pl.lit("")),
                # pl.when(pl.col("flags0_1") & 1 << 1 > 0).then(pl.lit("<複数回消耗品>")).otherwise(pl.lit("")),
                # pl.when(pl.col("flags0_1") & 1 << 2 > 0).then(pl.lit("<エンチャント>")).otherwise(pl.lit("")),
                pl.when(pl.col("flags0_1") & 1 << 4 > 0)
                .then(pl.lit("<NPC売却禁止>"))
                .otherwise(pl.lit("")),
                # pl.when(pl.col("flags0_1") & 1 << 5 > 0).then(pl.lit("<自己復活>")).otherwise(pl.lit("")),
                # pl.when(pl.col("flags0_1") & 1 << 6 > 0).then(pl.lit("<他者復活>")).otherwise(pl.lit("")),
                pl.when(pl.col("flags0_1") & 1 << 7 > 0)
                .then(pl.lit("<ベルト着用可>"))
                .otherwise(pl.lit("")),
                pl.when(pl.col("unknown5_47") & 1 << 6 > 0)
                .then(pl.lit("<錬成可能>"))
                .otherwise(pl.lit("")),
                pl.when(pl.col("unknown5_65") & 1 << 5 > 0)
                .then(pl.lit("<ユニーク分解不可>"))
                .otherwise(pl.lit("")),
            ],
            return_dtype=pl.String,
        ),
        Extra=pl.concat_list("F0", "F1", "F2", "F3"),
        Exclusive=(
            # unknown5_7: 指輪
            pl.col("unknown5_7").eq(2)
            # unknown5_75: 遺物
            | pl.col("unknown5_75").and_(1).gt(0)
        ),
    )


@app.function
def prepare_dicts(df: pl.DataFrame) -> dict[str, dict[str, Any]]:
    def remove_nulls(obj):
        if isinstance(obj, dict):
            obj = {k: remove_nulls(v) for k, v in obj.items() if v is not None}
        return obj

    return {f"{x['Id']}": remove_nulls(x) for x in df.to_dicts()}


@app.function
def decode_smi(fp: Path) -> list[Image.Image]:
    with open(fp, "rb") as _f:
        smi = _f.read()

    n_bits = unpack_from("<h", smi, 0x3C)[0]

    idx = 0x40
    n_images = unpack_from("<q", smi, idx)[0]
    idx += calcsize("<q")

    # addrs = np.frombuffer(smi, np.int32, n_images, idx)
    idx += 4 * n_images
    images: list[Image.Image] = n_images * [None]
    for i in range(n_images):
        x, y = unpack_from("<2h", smi, idx)
        idx += calcsize("<2h")
        match n_bits:
            case 0x08:
                img = Image.frombuffer(
                    "P", (x, y), smi[idx : idx + x * y], "raw", "P", 0, 1
                )
                img.putpalette([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255])
                img = img.convert("RGB", palette=Image.Palette.WEB)
                idx += x * y
            case 0x10:
                img = Image.frombuffer(
                    "RGB", (x, y), smi[idx : idx + 2 * x * y], "raw", "BGR;15"
                )
                idx += 2 * x * y
            case _:
                raise ValueError(n_bits)

        idx += 0x20
        images[i] = img
    return images


@app.cell
def _(is_cli):
    mo.stop(is_cli)

    kr = mo.ui.checkbox(value=False, label="kr")
    show_all_cols = mo.ui.checkbox(value=False, label="show_all_cols")

    mo.md(f"""
    {kr}
    {show_all_cols}
    """)
    return kr, show_all_cols


@app.cell
def _(RSPath, is_cli, kr):
    mo.stop(is_cli)

    fp_japan_llt = RSPath("Data/language/japan.llt")
    fp_item = RSPath("Data/Scenario/Red Stone/item.dat", kr=kr.value)
    fp_iconitem = RSPath("Data/Misc/iconItem.smi", kr=kr.value)

    mo.md(f"""
    - `{fp_japan_llt = }`
    - `{fp_item = }`
    - `{fp_iconitem = }`
    """)
    return fp_item, fp_japan_llt


@app.cell
def _(fp_japan_llt):
    df_japan_llt = decode_lang(fp_japan_llt)
    return (df_japan_llt,)


@app.cell
def _(decode_item, df_japan_llt, fp_item):
    df_item = (
        decode_item(fp_item)[0]
        .lazy()
        .join(
            df_japan_llt.lazy().filter(pl.col("i2") == 67).select(id="i3", name_jp="v"),
            on="id",
            how="full",
            coalesce=True,
        )
        .select(pl.col("id", "name_jp"), pl.exclude("id", "name_jp"))
        .drop(cs.starts_with("_"))
        .drop("name", "address_data")
        .collect()
    )
    return (df_item,)


@app.cell
def _(df_item, show_all_cols):
    (
        df_item
        .pipe(
            mo.ui.table,
            selection=None,
            show_column_summaries=True,
            freeze_columns_left=["id", "name_jp"],
            max_columns=None if show_all_cols.value else 50,
        )
    )
    return


if __name__ == "__main__":
    app.run()
