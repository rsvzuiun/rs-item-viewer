import { carving, carving_ring } from "../carving";
import * as C from "../const";
import { getParams, isKr } from "../params";
import { itemdata, itemname, itemtext, textdata } from "../store";
import {
  opPrtValue,
  replaceColorTag,
  replaceOpText,
  replaceTextData,
} from "../text";
import { Item } from "../types";
import { equals } from "../util";

export const tooltip = (id: number) => {
  const { nodiff } = getParams();

  const item = itemdata[id]!;
  const nxitem =
    !nodiff && item.NxId && item.NxId !== item.Id
      ? itemdata[item.NxId]
      : undefined;

  return gen_tooltip(item, nxitem);
};

const diffline = (cond: boolean | undefined) => cond && "item-different-line";

const gen_tooltip = (item: Item, other: Item | undefined) => {
  const { nodiff, noimage } = getParams();

  const tooltip = (
    <div
      translate={false}
      class={[
        "tooltip",
        item.Rank === "NX" ? "border-nx" : "border-normal",
        !nodiff && "diff",
      ]}
    ></div>
  );

  if (!noimage) {
    const image = (
      <div class="image">
        {item.ImageId >= 0 && (
          <img src={`img/item/${item.ImageId}.png`} width="34" height="34" />
        )}
        {item.Rank !== "N" && (
          <img class="rank" src={`img/ui/type-icon-${item.Rank}.gif`} />
        )}
        {item.Grade !== "N" && (
          <img class="grade" src={`img/ui/type-icon-${item.Grade}.gif`} />
        )}
      </div>
    );
    if (item.Id >= 0) {
      tooltip.appendChild(
        <div>
          <a is="spa-anchor" href={`?${isKr() ? "kr=1&" : ""}id=${item.Id}`}>
            {image}
          </a>
        </div>
      );
    } else {
      tooltip.appendChild(<div>{image}</div>);
    }
  }
  {
    tooltip.appendChild(
      <div
        class={[
          "name",
          diffline(other && itemname[item.Id] !== itemname[other.Id]),
        ]}
        translate={true}
      >
        {isKr() ? (
          <span
            class={item.Rank !== "N" && "item-name-" + item.Rank}
            lang="ko"
            dangerouslySetInnerHTML={replaceColorTag(item.Name)}
          ></span>
        ) : (
          <span
            class={item.Rank !== "N" && "item-name-" + item.Rank}
            dangerouslySetInnerHTML={replaceColorTag(itemname[item.Id] || item.Name)}
          ></span>
        )}
      </div>
    );
  }
  if (item.AtParam?.Max || item.OpPrt.length || item.OpBit.length) {
    tooltip.appendChild(<div class="label">&lt;基本情報&gt;</div>);
    if (!C.not_equipment.includes(item.Type)) {
      tooltip.appendChild(<div>- {C.item_type[item.Type]}</div>);
    }
    if (item.Flags?.includes("<取引不可>")) {
      tooltip.appendChild(
        <div>
          <span class="text-color-PURPLE">- 取引不可アイテム</span>
        </div>
      );
    }
    if (item.Flags?.includes("<銀行取引不可>")) {
      tooltip.appendChild(
        <div>
          <span class="text-color-PURPLE">- 銀行取引不可</span>
        </div>
      );
    }
    if (item.Exclusive) {
      tooltip.appendChild(
        <div>
          <span class="text-color-PURPLE">
            - 装備数制限(<span class="text-color-LTYELLOW">0/1</span>)
          </span>
        </div>
      );
    }
  }
  if (item.Grade !== "N") {
    tooltip.appendChild(
      <div>
        - 耐久力 <span class="text-color-LTYELLOW">100％</span>
      </div>
    );
  }
  {
    const atmin = item.AtParam?.Min || 0;
    const atmax = item.AtParam?.Max || 0;
    const speed = item.AtParam?.Speed || 0;

    if (atmin !== 0 || atmax !== 0) {
      tooltip.appendChild(
        <div class={diffline(other && !equals(item.AtParam, other.AtParam))}>
          - 攻撃力{" "}
          <span class="text-color-LTYELLOW">
            {atmin}~{atmax}
          </span>
          {speed && [
            "(",
            <span class="text-color-LTYELLOW">{(speed / 100).toFixed(2)}</span>,
            "秒)",
          ]}
        </div>
      );
    }
  }
  {
    const range = item.AtParam?.Range || 0;
    if (range !== 0) {
      tooltip.appendChild(
        <div
          class={diffline(other && item.AtParam.Range !== other.AtParam.Range)}
        >
          - 射程距離 <span class="text-color-LTYELLOW">{range}</span>
        </div>
      );
    }
  }
  if (item.OpPrt) {
    item.OpPrt.map((baseop, idx) => {
      if (baseop.Id === -1 || textdata.baseop[baseop.Id] === "") return null;

      const Value = opPrtValue(item, idx);
      const opText =
        typeof textdata.baseop[baseop.Id] === "undefined"
          ? `&lt;unknown_base id=${baseop.Id} value=[${Value}]&gt;`
          : replaceOpText(textdata.baseop[baseop.Id], Value, item.Extra);

      return (
        <div
          class={diffline(
            other &&
              (item.OpPrt[idx]?.Id !== other.OpPrt[idx]?.Id ||
                !equals(Value, opPrtValue(other, idx)))
          )}
          title={`baseop: ${baseop.Id}, ${JSON.stringify(Value)}`}
          dangerouslySetInnerHTML={`- ${opText}`}
        ></div>
      );
    })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  }
  if (item.OpBit.some((e) => e.Id !== 0)) {
    item.OpBit.map((option, idx) => {
      if (option.Id === -1 || textdata.op[option.Id] === "") return null;

      const opText =
        typeof textdata.op[option.Id] === "undefined"
          ? `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`
          : replaceOpText(textdata.op[option.Id], option.Value, item.Extra);
      return (
        <div
          class={diffline(other && !equals(item.OpBit[idx], other.OpBit[idx]))}
          title={`op: ${option.Id}, ${JSON.stringify(option.Value)}`}
          dangerouslySetInnerHTML={`- ${opText}`}
        ></div>
      );
    })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  } else {
    // console.log(item);
  }
  if (other && item.OpBit.length < other.OpBit.length) {
    for (let i = 0; i < other.OpBit.length - item.OpBit.length; i++) {
      tooltip.appendChild(
        <div class="text-color-GRAY item-different-line">- なし</div>
      );
    }
  }
  if (item?.OpPrt[0]?.Id === 773) {
    const q = item.OpBit.find((e) => e.Id === 774);
    if (q == null) throw new Error();
    const [setid, equipid] = q.Value;

    tooltip.appendChild(
      <div class="label">
        {carving[setid]
          ? `<刻印 - ${carving[setid].name}[${carving[setid][equipid].name}]>`
          : `<刻印 - #${setid}>`}
      </div>
    );
    tooltip.appendChild(
      <div>
        <span class="text-color-PURPLE">
          - 同じ刻印装備の着用制限 <span class="text-color-LTYELLOW">0/1</span>
        </span>
      </div>
    );
    tooltip.appendChild(<div>- レベル 30</div>);
    if (carving[setid]) {
      carving[setid][equipid].op
        .map((option) => {
          // NOTE OpBit との違い
          // * op -> baseop
          // * diffline 不要
          if (option.Id === -1 || textdata.baseop[option.Id] === "")
            return null;

          const opText =
            typeof textdata.baseop[option.Id] === "undefined"
              ? `&lt;unknown_baseop id=${option.Id} value=${option.Value}&gt;`
              : replaceOpText(textdata.baseop[option.Id], option.Value, item.Extra);
          return (
            <div
              title={`baseop: ${option.Id}, ${JSON.stringify(option)}`}
              dangerouslySetInnerHTML={`- ${opText}`}
            ></div>
          );
        })
        .flatMap((v) => v ?? [])
        .map((elm) => tooltip.appendChild(elm));
    }
  }
  if (
    item?.OpPrt[1]?.Id &&
    Object.keys(carving_ring).includes(item?.OpPrt[1]?.Id.toString())
  ) {
    tooltip.appendChild(<div class="label">&lt;刻印効果&gt;</div>);

    if (carving_ring[item.OpPrt[1].Id]) {
      carving_ring[item.OpPrt[1].Id]
        .map((option) => {
          const opText = replaceOpText(option.Text, option.Value, item.Extra);
          return <div dangerouslySetInnerHTML={`- ${opText}`}></div>;
        })
        .flatMap((v) => v ?? [])
        .map((elm) => tooltip.appendChild(elm));
    }
  }
  if (other || item.Rank === "NX") {
    tooltip.appendChild(<div class="label">&lt;錬成 オプション 情報&gt;</div>);
  }
  if (item.Rank === "NX") {
    item.OpNxt.map((option) => {
      if (option.Id === -1 || textdata.op[option.Id] === "") return null;

      const opText =
        typeof textdata.op[option.Id] === "undefined"
          ? `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`
          : replaceOpText(textdata.op[option.Id], option.Value, item.Extra);
      return (
        <div
          class={diffline(other != null)}
          title={`op: ${option.Id}, ${JSON.stringify(option.Value)}`}
          dangerouslySetInnerHTML={`- ${opText}`}
        ></div>
      );
    })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  }
  if (other && item.Rank !== "NX") {
    for (let i = 0; i < 4; i++) {
      tooltip.appendChild(
        <div class="text-color-GRAY item-different-line">- なし</div>
      );
    }
  }
  tooltip.appendChild(<div class="label">&lt;説明&gt;</div>);
  tooltip.appendChild(
    <div
      translate={true}
      lang={isKr() ? "ko" : undefined}
      dangerouslySetInnerHTML={`- ${replaceTextData(isKr() ? item.Text : itemtext[item.Id] || item.Text)}`}
    ></div>
  );

  if (item.Require && Object.keys(item.Require).length) {
    tooltip.appendChild(<div class="label">&lt;要求能力値&gt;</div>);

    (Object.keys(item.Require) as (keyof typeof item.Require)[])
      .map((key) => {
        // TODO
        const value = item.Require[key];
        if (typeof value === "undefined") throw Error();
        const row = <div></div>;
        if (typeof value === "number") {
          const html = /* html */ `- ${
            C.status_type[key as number]
          } <span class='text-color-LTYELLOW'>${value}</span>`;
          row.innerHTML = html;
        } else {
          const base = item.ValueTable[value.ValueIndex];
          const html = /* html */ `- ${C.extra_status_type[value.StatusType]}
<span class='text-color-LTYELLOW'>${value.MulValue} * [${base[0]}~${
            base[1]
          }]</span>`;
          row.innerHTML = html;
        }
        return row;
      })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  }
  if (item.Job?.length) {
    tooltip.appendChild(<div class="label">&lt;着用/使用可能な職業&gt;</div>);
    item.Job.map((job) => <div>- {C.job_type[job]}</div>)
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  }
  if (!nodiff && item.Id >= 0) {
    tooltip.appendChild(<div class="label">&lt;システム情報&gt;</div>);

    tooltip.appendChild(
      <div title={JSON.stringify(item)}>
        - ID <span class="text-color-LTYELLOW">{item.Id}</span>
      </div>
    );

    if (item.StackSize > 1) {
      tooltip.appendChild(
        <div>
          - 重ね置き <span class="text-color-LTYELLOW">{item.StackSize}</span>
        </div>
      );
    }

    if (item.Durability) {
      tooltip.appendChild(
        <div>
          - 耐久減少 <span class="text-color-LTYELLOW">{item.Durability}</span>
          型
        </div>
      );
    }

    if (item.DropLv) {
      tooltip.appendChild(
        <div>
          - ドロップレベル{" "}
          <span class="text-color-LTYELLOW">{item.DropLv}</span>
        </div>
      );
    }

    if (item.DropFactor) {
      tooltip.appendChild(
        <div>
          - ドロップ係数{" "}
          <span class="text-color-LTYELLOW">{item.DropFactor}</span>
        </div>
      );
    }

    if (item.Price && item.PriceFactor) {
      tooltip.appendChild(
        <div>
          - 価格{" "}
          <span class="text-color-LTYELLOW">
            {Math.floor((item.Price * item.PriceFactor) / 100).toLocaleString()}{" "}
            Gold
          </span>
        </div>
      );
    }

    if (item.Flags) {
      tooltip.appendChild(
        <div>
          - Flags <span class="text-color-LTYELLOW">{item.Flags}</span>
        </div>
      );
    }
  }

  if (other && item.Rank !== "NX") {
    const root = <div class="nx-pair"></div>;
    root.appendChild(tooltip);
    root.appendChild(gen_tooltip(other, item));
    return root;
  } else {
    return tooltip;
  }
};
