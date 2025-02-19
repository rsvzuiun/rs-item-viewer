import { carving, carving_ring } from "../carving";
import * as C from "../const";
import { getParams, isKr } from "../params";
import { itemdata, itemname, itemtext, textdata } from "../store";
import {
  opPrtValue,
  replaceColorTag,
  replaceOpText,
  replaceTextData,
  yellow,
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

const gen_tooltip = (item: Item, nxitem: Item | undefined) => {
  const { nodiff } = getParams();

  const tooltip = document.createElement("div");
  tooltip.translate = false;
  tooltip.className = "tooltip";
  tooltip.classList.add(item.Rank === "NX" ? "border-nx" : "border-normal");
  if (!nodiff) tooltip.classList.add("diff");

  {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    const image = document.createElement("div");
    if (item.Id >= 0) {
      const anchor = document.createElement("a", { is: "spa-anchor" });
      row.appendChild(anchor);
      anchor.href = `?${isKr() ? "kr=1&" : ""}id=${item.Id}`;
      anchor.appendChild(image);
    } else {
      row.appendChild(image);
    }
    image.className = "image";

    if (item.ImageId >= 0) {
      image.insertAdjacentHTML(
        "beforeend",
        /* html */ `<img src="img/item/${item.ImageId}.png" width="34" height="34" />`
      );
    }

    if (item.Rank !== "N") {
      image.insertAdjacentHTML(
        "beforeend",
        /* html */ `<img class="rank" src="img/ui/type-icon-${item.Rank}.gif" />`
      );
    }
    if (item.Grade !== "N") {
      image.insertAdjacentHTML(
        "beforeend",
        /* html */ `<img class="grade" src="img/ui/type-icon-${item.Grade}.gif" />`
      );
    }
  }
  {
    const row = document.createElement("div");
    row.translate = true;
    tooltip.appendChild(row);
    row.className = "name";

    const item_name = document.createElement("span");
    row.appendChild(item_name);
    if (isKr()) {
      item_name.innerHTML = replaceColorTag(item.Name);
      item_name.lang = "ko";
    } else {
      item_name.innerHTML = replaceColorTag(itemname[item.Id]);
    }
    if (item.Rank !== "N") {
      item_name.className = "item-name-" + item.Rank;
    }
    if (nxitem && itemname[item.Id] !== itemname[nxitem.Id]) {
      row.classList.add("item-different-line");
    }
  }
  if (item.AtParam?.Max || item.OpPrt.length || item.OpBit.length) {
    {
      const row = document.createElement("div");
      tooltip.appendChild(row);

      row.className = "label";
      row.innerText = "<基本情報>";
    }
    if (!C.not_equipment.includes(item.Type)) {
      const row = document.createElement("div");
      tooltip.appendChild(row);
      row.innerText = "- " + C.item_type[item.Type];
    }
    if (item.Flags?.includes("<取引不可>")) {
      const row = document.createElement("div");
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag("<c:PURPLE>- 取引不可アイテム<n>");
    }
    if (item.Flags?.includes("<銀行取引不可>")) {
      const row = document.createElement("div");
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag("<c:PURPLE>- 銀行取引不可<n>");
    }
    if (item.Exclusive) {
      const row = document.createElement("div");
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag(
        "<c:PURPLE>- 装備数制限(<n><c:LTYELLOW>0/1<n><c:PURPLE>)<n>"
      );
    }
  }
  if (item.Grade !== "N") {
    const row = document.createElement("div");
    tooltip.appendChild(row);
    row.innerHTML = replaceColorTag("- 耐久力 <c:LTYELLOW>100％<n>");
  }
  {
    const atmin = item.AtParam?.Min || 0;
    const atmax = item.AtParam?.Max || 0;
    const speed = item.AtParam?.Speed || 0;

    if (atmin !== 0 || atmax !== 0) {
      const row = document.createElement("div");
      tooltip.appendChild(row);

      let html = /* html */ `- 攻撃力 <span class='text-color-LTYELLOW'>${atmin}~${atmax}</span>`;
      if (speed) {
        html += /* html */ `(<span class='text-color-LTYELLOW'>${(
          speed / 100
        ).toFixed(2)}</span>秒)`;
      }
      row.innerHTML = html;
      if (nxitem && !equals(item.AtParam, nxitem.AtParam)) {
        row.className = "item-different-line";
      }
    }
  }
  {
    const range = item.AtParam?.Range || 0;
    if (range !== 0) {
      const html = /* html */ `- 射程距離 <span class='text-color-LTYELLOW'>${range}</span>`;
      const row = document.createElement("div");
      tooltip.appendChild(row);
      row.innerHTML = html;
      if (nxitem && item.AtParam.Range !== nxitem.AtParam.Range) {
        row.className = "item-different-line";
      }
    }
  }
  if (item.OpPrt) {
    item.OpPrt.map((baseop, idx) => {
      if (baseop.Id === -1) return null;

      const row = document.createElement("div");

      const Value = opPrtValue(item, idx);
      row.title = `baseop: ${baseop.Id}, ${JSON.stringify(Value)}`;
      let opText = replaceOpText(textdata.baseop[baseop.Id], Value, item.Extra);
      if (!opText) return null;
      if (opText === "undefined") {
        opText = `&lt;unknown_base id=${baseop.Id} value=[${Value}]&gt;`;
      }
      row.innerHTML = "- " + opText;
      if (
        nxitem &&
        (item.OpPrt[idx]?.Id !== nxitem.OpPrt[idx]?.Id ||
          !equals(Value, opPrtValue(nxitem, idx)))
      ) {
        row.className = "item-different-line";
      }
      return row;
    })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  }
  if (item.OpBit.some((e) => e.Id !== 0)) {
    // TODO: 例外系の見直し
    item.OpBit.map((option, idx) => {
      const row = document.createElement("div");
      row.title = `op: ${option.Id}, ${JSON.stringify(option.Value)}`;

      let opText = "";
      if (option.Text) {
        opText = replaceOpText(option.Text, option.Value, item.Extra);
      } else if (option.Id === -1) {
        return null;
      } else {
        opText = replaceOpText(
          textdata.op[option.Id],
          option.Value,
          item.Extra
        );
        if (!opText) return null;
        if (opText === "undefined") {
          opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
        }
      }

      row.innerHTML = "- " + opText;
      if (nxitem && !equals(item.OpBit[idx], nxitem.OpBit[idx])) {
        row.className = "item-different-line";
      }
      return row;
    })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  } else {
    // console.log(item);
  }
  if (nxitem && item.OpBit.length < nxitem.OpBit.length) {
    for (let i = 0; i < nxitem.OpBit.length - item.OpBit.length; i++) {
      const row = document.createElement("div");
      row.className = "text-color-GRAY item-different-line";
      row.innerText = "- なし";
      tooltip.appendChild(row);
    }
  }
  if (item?.OpPrt[0]?.Id === 773) {
    const q = item.OpBit.find((e) => e.Id === 774);
    try {
      if (q == null) throw new Error();
      const [setid, equipid] = q.Value;

      const label = document.createElement("div");
      tooltip.appendChild(label);

      label.className = "label";
      label.innerText = carving[setid]
        ? `<刻印 - ${carving[setid].name}[${carving[setid][equipid].name}]>`
        : `<刻印 - #${setid}>`;

      {
        const row = document.createElement("div");
        tooltip.appendChild(row);
        row.innerHTML = replaceColorTag(
          "<c:PURPLE>- 同じ刻印装備の着用制限<n> <c:LTYELLOW>0/1<n>"
        );
      }
      {
        const row = document.createElement("div");
        tooltip.appendChild(row);
        row.innerText = "- レベル 30";
      }
      if (carving[setid]) {
        carving[setid][equipid].op
          .map((option) => {
            const row = document.createElement("div");
            row.title = `baseop: ${option.Id}, ${JSON.stringify(option)}`;

            let opText = "";
            if (option.Id === -1) {
              opText = replaceOpText(option.Text!, option.Value, item.Extra);
            } else {
              opText = replaceOpText(
                textdata.baseop[option.Id],
                option.Value,
                item.Extra
              );
              if (!opText) return null;
              if (opText === "undefined") {
                opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
              }
            }
            row.innerHTML = "- " + opText;
            return row;
          })
          .flatMap((v) => v ?? [])
          .map((elm) => tooltip.appendChild(elm));
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (
    item?.OpPrt[1]?.Id &&
    Object.keys(carving_ring).includes(item?.OpPrt[1]?.Id.toString())
  ) {
    const label = document.createElement("div");
    tooltip.appendChild(label);

    label.className = "label";
    label.innerText = "<刻印効果>";

    if (carving_ring[item.OpPrt[1].Id]) {
      carving_ring[item.OpPrt[1].Id]
        .map((option) => {
          const row = document.createElement("div");
          row.title = `baseop: ${option.Id}, ${JSON.stringify(option)}`;

          let opText = "";
          if (option.Id === -1) {
            opText = replaceOpText(option.Text!, option.Value, item.Extra);
          } else {
            opText = replaceOpText(
              textdata.op[option.Id],
              option.Value,
              item.Extra
            );
            if (!opText) return null;
            if (opText === "undefined") {
              opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
            }
          }
          row.innerHTML = "- " + opText;
          return row;
        })
        .flatMap((v) => v ?? [])
        .map((elm) => tooltip.appendChild(elm));
    }
  }
  if (nxitem || item.Rank === "NX") {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    row.className = "label";
    row.innerText = "<錬成 オプション 情報>";
  }
  if (item.Rank === "NX") {
    item.OpNxt.map((option) => {
      const row = document.createElement("div");
      row.title = `op: ${option.Id}, ${JSON.stringify(option.Value)}`;

      let opText = "";
      if (option.Text) {
        opText = replaceOpText(option.Text, option.Value, item.Extra);
      } else if (option.Id === -1) {
        return null;
      } else {
        opText = replaceOpText(
          textdata.op[option.Id],
          option.Value,
          item.Extra
        );
        if (!opText) return null;
        if (opText === "undefined") {
          opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
        }
      }

      row.innerHTML = "- " + opText;
      if (nxitem) {
        row.className = "item-different-line";
      }
      return row;
    })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  }
  if (nxitem && item.Rank !== "NX") {
    for (let i = 0; i < 4; i++) {
      const row = document.createElement("div");
      row.className = "text-color-GRAY item-different-line";
      row.innerText = "- なし";
      tooltip.appendChild(row);
    }
  }
  {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    row.className = "label";
    row.innerText = "<説明>";
  }
  {
    const row = document.createElement("div");
    row.translate = true;
    tooltip.appendChild(row);

    if (isKr()) {
      row.innerHTML = "- " + replaceTextData(item.Text);
      row.lang = "ko";
    } else {
      row.innerHTML = "- " + replaceTextData(itemtext[item.Id]);
    }
  }
  if (item.Require && Object.keys(item.Require).length) {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    row.className = "label";
    row.innerText = "<要求能力値>";

    (Object.keys(item.Require) as (keyof typeof item.Require)[])
      .map((key) => {
        const value = item.Require[key];
        if (typeof value === "undefined") throw Error();
        const row = document.createElement("div");
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
    const row = document.createElement("div");
    tooltip.appendChild(row);

    row.className = "label";
    row.innerText = "<着用/使用可能な職業>";

    item.Job.map((job) => {
      const row = document.createElement("div");
      row.innerHTML = "- " + C.job_type[job];
      return row;
    })
      .flatMap((v) => v ?? [])
      .map((elm) => tooltip.appendChild(elm));
  }
  if (!nodiff && item.Id >= 0) {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    row.className = "label";
    row.innerText = "<システム情報>";

    const Id = document.createElement("div");
    tooltip.appendChild(Id);
    Id.innerHTML = `- ID ${yellow(item.Id)}`;
    Id.title = JSON.stringify(item);

    if (item.StackSize > 1) {
      const StackSize = document.createElement("div");
      tooltip.appendChild(StackSize);
      StackSize.innerHTML = `- 重ね置き ${yellow(item.StackSize)}`;
    }

    if (item.Durability) {
      const Durability = document.createElement("div");
      tooltip.appendChild(Durability);
      Durability.innerHTML = `- 耐久減少 ${yellow(item.Durability)}型`;
    }

    if (item.DropLv) {
      const DropLv = document.createElement("div");
      tooltip.appendChild(DropLv);
      DropLv.innerHTML = `- ドロップレベル ${yellow(item.DropLv)}`;
    }

    if (item.DropFactor) {
      const DropFactor = document.createElement("div");
      tooltip.appendChild(DropFactor);
      DropFactor.innerHTML = `- ドロップ係数 ${yellow(item.DropFactor)}`;
    }

    if (item.Price && item.PriceFactor) {
      const Price = document.createElement("div");
      tooltip.appendChild(Price);
      Price.innerHTML = `- 価格 ${yellow(
        Math.floor((item.Price * item.PriceFactor) / 100).toLocaleString()
      )} Gold`;
    }

    if (item.Flags) {
      const Flags = document.createElement("div");
      tooltip.appendChild(Flags);
      Flags.innerHTML = `- Flags ${yellow(item.Flags)}`;
    }
  }

  if (nxitem && item.Rank !== "NX") {
    const root = document.createElement("div");
    root.className = "nx-pair";
    root.appendChild(tooltip);
    root.appendChild(gen_tooltip(nxitem, item));
    return root;
  } else {
    return tooltip;
  }
};
