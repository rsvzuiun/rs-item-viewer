import "./main.css";
import * as C from "./const";
import { engraved, engraved_ring } from "./engraved";
import { Item, ItemData, Require, TextData } from "./types";
import {
  equals,
  yellow,
  replaceOpText,
  replaceTextData,
  replaceColorTag,
  opPrtValue,
} from "./util";
import { genSPAAnchor } from "./SPAAnchor";
import { index, sandbox } from "./pages";

import FormStorage from "form-storage";

let itemdata_url: string = C.itemdata_url;
const textdata_url = C.textdata_url;
let itemdata: ItemData;
let textdata: TextData;

let SEARCH_LIMIT = 2000;
let storage: FormStorage;
let aborted = false;

document.addEventListener("DOMContentLoaded", async () => {
  if (new URL(window.location.href).searchParams.get("kr")) {
    itemdata_url = "data/itemData-kr.json";
    document.body.lang = "kr";
  } else {
    itemdata_url = "data/itemData.json";
  }

  [itemdata, textdata] = await Promise.all(
    [itemdata_url, textdata_url].map((url) =>
      fetch(url).then((response) => response.json())
    )
  );
  customElements.define("spa-anchor", genSPAAnchor(update), { extends: "a" });
  window.addEventListener("popstate", async () => {
    aborted = true;
    await new Promise((resolve) => setTimeout(resolve, 0));
    update();
  });
  update();
});

const update = async () => {
  const app = document.getElementById("app");
  if (app == null) throw new Error();
  app.textContent = "";
  app.appendChild(header());
  await router(app);
  app.appendChild(footer());
  for (const form of document.getElementsByTagName("form")) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = new URL(window.location.href);

      const proc_select = (src: string, dst: string) => {
        const m = (form.querySelector(src) as HTMLInputElement).value.match(
          /^(\d+)/
        );
        if (m) url.searchParams.set(dst, m[1]);
      };
      proc_select("#selectop", "op");
      proc_select("#selecttype", "type");
      proc_select("#selectjob", "job");

      for (const input of form.getElementsByTagName("input")) {
        if (input.type === "radio" || input.type === "checkbox") {
          if (input.value && input.checked) {
            url.searchParams.set(input.name, input.value);
          }
        } else if (!input.name.includes("select") && input.value) {
          url.searchParams.set(input.name, input.value);
        }
      }
      storage.save();
      window.history.pushState(null, "", url.search);
      update();
    });
  }
  if (new URL(window.location.href).searchParams.toString() === "") {
    storage = new FormStorage("form", {
      name: "rs-item-viewer",
      ignores: ['[type="hidden"]'],
    });
    storage.apply();
  }
};

const router = async (app: HTMLElement) => {
  const params = new URL(window.location.href).searchParams;

  if (params.get("sandbox")) {
    return sandbox(app);
  }

  if (params.toString() === "") {
    return index(app, textdata);
  }

  const hidden = params.get("oo");
  if (hidden) {
    SEARCH_LIMIT = Infinity;
  }

  const id = params.get("id");
  const query = params.get("q");
  const not_query = params.get("nq");
  const type = parseInt(params.get("type") || "");
  const op = parseInt(params.get("op") || "");
  const baseop = parseInt(params.get("baseop") || "");
  const rank = params.get("rank");
  const grade = params.get("grade");
  const group = params.get("group");
  const job = parseInt(params.get("job") || "");
  const lv = parseInt(params.get("lv") || "");

  const A = params.get("A");
  const D = params.get("D");
  const E = params.get("E");
  const G = params.get("G");
  const R = params.get("R");

  let hit = Object.keys(itemdata).map((e) => parseInt(e));

  const keyword = params.get("keyword");
  if (keyword) {
    hit = hit.filter((e) => itemdata[e].Text.match(keyword));
  }

  if (id) {
    const maxid = parseInt(Object.keys(itemdata).slice(-1)[0]);
    const range = new Set(
      id
        .split(",")
        .map((e) => {
          const m = e.match(/^(\d+)(-)?(\d+)?$/);
          if (m) {
            if (m[3]) {
              // begin-end
              const min = parseInt(m[1]);
              const max = parseInt(m[3]);
              return [...Array(max - min + 1)].map((_v, i) => i + min);
            } else if (m[2]) {
              // begin-
              const min = parseInt(m[1]);
              return [...Array(maxid - min + 1)].map((_v, i) => i + min);
            } else if (m[1]) {
              // id
              return parseInt(m[1]);
            }
          }
          throw "error";
        })
        .flat()
    );

    if (range.size === 1) {
      app.appendChild(render([...range.keys()][0]));
      return;
    } else {
      hit = [...range.keys()].filter((e) => itemdata[e]);
    }
  }

  if (query) hit = hit.filter((e) => itemdata[e].Name.match(query));
  if (not_query) hit = hit.filter((e) => !itemdata[e].Name.match(not_query));
  if (type >= 0) hit = hit.filter((e) => itemdata[e].Type === type);
  if (op >= 0) {
    hit = hit.filter(
      (e) =>
        itemdata[e].OpBit.some((i) => i.Id === op) ||
        itemdata[e].OpNxt.some((i) => i.Id === op)
    );
  }
  if (baseop >= 0) {
    hit = hit.filter((e) => itemdata[e].OpPrt.some((i) => i.Id === baseop));
  }
  if (rank) {
    hit = hit.filter((e) => itemdata[e].Rank === rank);
  }
  if (grade) {
    hit = hit.filter((e) => itemdata[e].Grade === grade);
  }
  if (group === "w") {
    hit = hit.filter((e) => {
      const item = itemdata[e];
      return (
        item.AtParam.Range > 0 ||
        (item.Job.includes(7) && ![17, 50, 59, 73].includes(item.Type))
      );
    });
  }
  if (group === "nw") {
    hit = hit.filter((e) => {
      const item = itemdata[e];
      return (
        item.AtParam.Range <= 0 &&
        !(item.Job.includes(7) && ![17, 50, 59, 73].includes(item.Type))
      );
    });
  }
  if (job >= 0) {
    hit = hit.filter((e) => itemdata[e].Job.includes(job));
  } else if (job === -1) {
    hit = hit.filter((e) => itemdata[e].Job.length === 0);
  } else if (job === -2) {
    hit = hit.filter((e) => itemdata[e].Job.length > 0);
  }
  if (lv > 0) {
    hit = hit.filter((e) => itemdata[e].Require["0"] === lv);
  } else if (lv === 0) {
    hit = hit.filter((e) => itemdata[e].Require["0"] == null);
  }
  {
    const nxids = hit
      .filter(
        (e) =>
          itemdata[e].Rank !== "NX" &&
          itemdata[e].Id !== itemdata[e].NxId &&
          itemdata[e].NxId
      )
      .map((e) => itemdata[e].NxId);
    hit = hit.filter((e) => !nxids.includes(e));
  }
  if (A) {
    hit = hit.filter((e) => !itemdata[e].Name.includes("[A]"));
  }
  if (D) {
    hit = hit.filter((e) => !itemdata[e].Name.includes("[D]"));
  }
  if (E) {
    hit = hit.filter((e) => !itemdata[e].Name.includes("[E]"));
  }
  if (G) {
    hit = hit.filter((e) => !itemdata[e].Name.includes("[G]"));
  }
  if (R) {
    hit = hit.filter((e) => !itemdata[e].Name.includes("[R]"));
  }
  const result = document.createElement("p");
  app.appendChild(result);

  let restext = "";
  if (query) restext += ` 含む"${query}"`;
  if (not_query) restext += ` 含まない"${not_query}"`;
  if (type >= 0) restext += ` ${C.item_type[type]}`;
  if (op >= 0)
    restext += ` "${textdata.OptionBasic[op]?.replace(
      /<c:([^> ]+?)>(.+?)<n>/g,
      "$2"
    )}"`;
  if (baseop >= 0)
    restext += ` "${textdata.OptionProper[baseop]?.replace(
      /<c:([^> ]+?)>(.+?)<n>/g,
      "$2"
    )}"`;
  if (job >= 0) restext += ` ${C.job_type[job]}`;
  if (rank) restext += ` ${rank}`;
  if (grade) restext += ` ${grade}`;
  if (group === "w") restext += " 武器";
  if (group === "nw") restext += " 武器以外";
  restext += ` ${hit.length}件`;
  if (hit.length > SEARCH_LIMIT)
    restext += ` (${SEARCH_LIMIT}件に制限しています)`;
  result.innerText = restext;

  aborted = false;
  for await (const e of hit.slice(0, SEARCH_LIMIT)) {
    if (aborted) break;
    app.appendChild(render(e));
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

const header = () => {
  const header = document.createElement("div");
  header.innerHTML = /* html */ `
  <a is='spa-anchor' href='.'>[戻る]</a>
  `;
  return header;
};

const footer = () => {
  const footer = document.createElement("div");
  footer.innerHTML = /* html */ `
  <hr />
  <div><a href="https://github.com/rsvzuiun/rs-item-viewer">[CODE]</a> ${C.version}</div>
  <footer>
    当サイトで利用している画像及びデータは、株式会社ゲームオンに帰属します。<br />
    許可無くご利用又は転用になられる事は出来ませんので、予めご了承下さい。<br />
    Copyright (c) L&K Co., Ltd. All Rights Reserved. License to GameOn Co., Ltd.
  </footer>`;
  return footer;
};

const render = (id: number) => {
  const item = itemdata[id];
  const nxitem =
    item.NxId && item.NxId !== item.Id ? itemdata[item.NxId] : undefined;

  return gen_tooltip(item, nxitem);
};

const gen_tooltip = (item: Item, nxitem: Item | undefined) => {
  const tooltip = document.createElement("div");
  tooltip.translate = false;
  if (item.Rank === "NX") {
    tooltip.className = "tooltip border-nx";
  } else {
    tooltip.className = "tooltip border-normal";
  }

  {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    const image = document.createElement("div");
    if (item.Id >= 0) {
      const anchor = document.createElement("a", { is: "spa-anchor" });
      row.appendChild(anchor);
      if (new URL(window.location.href).searchParams.get("kr")) {
        anchor.href = `?kr=1&id=${item.Id}`;
      } else {
        anchor.href = `?id=${item.Id}`;
      }
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
    item_name.innerHTML = replaceColorTag(item.Name);
    if (item.Rank !== "N") {
      item_name.className = "item-name-" + item.Rank;
    }
    if (nxitem && item.Name !== nxitem.Name) {
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
      row.innerHTML = replaceColorTag("<c:CTPURPLE>- 取引不可アイテム<n>");
    }
    if (item.Flags?.includes("<銀行取引不可>")) {
      const row = document.createElement("div");
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag("<c:CTPURPLE>- 銀行取引不可<n>");
    }
    if (item.Exclusive) {
      const row = document.createElement("div");
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag(
        "<c:CTPURPLE>- 装備数制限(<n><c:LTYELLOW>0/1<n><c:CTPURPLE>)<n>"
      );
    }
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
        html += /* html */ ` (<span class='text-color-LTYELLOW'>${(
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
      let opText = replaceOpText(textdata.OptionProper[baseop.Id], ...Value);
      if (!opText) return null;
      if (opText === "undefined") {
        opText = `&lt;unknown_base id=${baseop.Id} value=[${Value}]&gt;`;
      } else {
        opText = opText.replace(/\[([+-]?)e\](0*％?)/g, (_org, sign, post) => {
          return yellow(`${sign}${item.Extra.toLocaleString()}${post}`);
        });
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
      .filter((v) => v)
      .map((elm) => tooltip.appendChild(elm!));
  }
  if (item.OpBit.some((e) => e.Id !== 0)) {
    // TODO: 例外系の見直し
    item.OpBit.map((option, idx) => {
      const row = document.createElement("div");
      row.title = `op: ${option.Id}, ${JSON.stringify(option.Value)}`;

      let opText = "";
      if (option.Text) {
        opText = replaceOpText(option.Text, ...option.Value);
      } else if (option.Id === -1) {
        return null;
      } else {
        opText = replaceOpText(
          textdata.OptionBasic[option.Id],
          ...option.Value
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
      .filter((v) => v)
      .map((elm) => tooltip.appendChild(elm!));
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
      label.innerText = engraved[setid]
        ? `<刻印 - ${engraved[setid].name}[${engraved[setid][equipid].name}]>`
        : `<刻印 - #${setid}>`;

      {
        const row = document.createElement("div");
        tooltip.appendChild(row);
        row.innerHTML = replaceColorTag(
          "<c:CTPURPLE>- 同じ刻印装備の着用制限<n> <c:LTYELLOW>0/1<n>"
        );
      }
      {
        const row = document.createElement("div");
        tooltip.appendChild(row);
        row.innerText = "- レベル 30";
      }
      if (engraved[setid]) {
        engraved[setid][equipid].op
          .map((option) => {
            const row = document.createElement("div");

            let opText = "";
            if (option.Id === -1) {
              opText = replaceOpText(option.Text!, ...option.Value);
            } else {
              opText = replaceOpText(
                textdata.OptionBasic[option.Id],
                ...option.Value
              );
              if (!opText) return null;
              if (opText === "undefined") {
                opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
              }
            }
            row.innerHTML = "- " + opText;
            return row;
          })
          .filter((v) => v)
          .map((elm) => tooltip.appendChild(elm!));
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (
    item?.OpPrt[1]?.Id &&
    Object.keys(engraved_ring).includes(item?.OpPrt[1]?.Id.toString())
  ) {
    const label = document.createElement("div");
    tooltip.appendChild(label);

    label.className = "label";
    label.innerText = "<刻印効果>";

    if (engraved_ring[item.OpPrt[1].Id]) {
      engraved_ring[item.OpPrt[1].Id]
        .map((option) => {
          const row = document.createElement("div");

          let opText = "";
          if (option.Id === -1) {
            opText = replaceOpText(option.Text!, ...option.Value);
          } else {
            opText = replaceOpText(
              textdata.OptionBasic[option.Id],
              ...option.Value
            );
            if (!opText) return null;
            if (opText === "undefined") {
              opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
            }
          }
          row.innerHTML = "- " + opText;
          return row;
        })
        .filter((v) => v)
        .map((elm) => tooltip.appendChild(elm!));
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
      if (option.Id === -1) return null;

      const row = document.createElement("div");
      row.title = `op: ${option.Id}, ${JSON.stringify(option.Value)}`;

      let opText = replaceOpText(
        textdata.OptionBasic[option.Id],
        ...option.Value
      );
      if (!opText) return null;
      if (opText === "undefined") {
        opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
      }
      row.innerHTML = "- " + opText;
      if (nxitem) {
        row.className = "item-different-line";
      }
      return row;
    })
      .filter((v) => v)
      .map((elm) => tooltip.appendChild(elm!));
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

    row.innerHTML = "- " + replaceTextData(item.Text);
  }
  if (item.Require && Object.keys(item.Require).length) {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    row.className = "label";
    row.innerText = "<要求能力値>";

    (Object.keys(item.Require) as (keyof Require)[])
      .map((key) => {
        const value = item.Require[key]!;
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
      .filter((v) => v)
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
      .filter((v) => v)
      .map((elm) => tooltip.appendChild(elm));
  }
  if (item.Id >= 0) {
    const row = document.createElement("div");
    tooltip.appendChild(row);

    row.className = "label";
    row.innerText = "<システム情報>";

    const Id = document.createElement("div");
    tooltip.appendChild(Id);
    Id.innerHTML = `- ID ${yellow(item.Id)}`;

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
