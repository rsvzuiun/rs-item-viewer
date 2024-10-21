import "./main.css";
import * as C from "./const";
import { carving, carving_ring } from "./carving";
import { Item, ItemData, TextData } from "./types";
import {
  equals,
  yellow,
  replaceOpText,
  replaceTextData,
  replaceColorTag,
  opPrtValue,
  str2range,
} from "./util";
import { genSPAAnchor } from "./SPAAnchor";
import { isIndex, isKr, getParams } from "./params";
import { index, weapon, protector } from "./pages";

import FormStorage from "form-storage";

let itemdata_url: string = C.itemdata_url;
let itemdata: ItemData;
const textdata: TextData = { baseop: [], op: [] };
let itemname: string[];
let itemtext: string[];

let SEARCH_LIMIT = 2000;
const storage = new FormStorage("form", {
  name: "rs-item-viewer",
  ignores: ['[type="hidden"]'],
});
let aborted = false;

document.addEventListener("DOMContentLoaded", async () => {
  if (isKr()) {
    itemdata_url = C.itemdatakr_url;
  } else {
    itemdata_url = C.itemdata_url;
  }

  [itemdata, textdata.baseop, textdata.op, itemname, itemtext] =
    await Promise.all(
      [
        itemdata_url,
        C.baseop_url,
        C.op_url,
        C.itemname_url,
        C.itemtext_url,
      ].map((url) => fetch(url).then((response) => response.json()))
    );
  customElements.define(
    "spa-anchor",
    genSPAAnchor(async () => {
      aborted = true;
      await new Promise((resolve) => setTimeout(resolve, 0));
      update();
    }),
    { extends: "a" }
  );
  window.addEventListener("popstate", async () => {
    aborted = true;
    await new Promise((resolve) => setTimeout(resolve, 0));
    update();
  });
  update();
});

function submit_handler(this: HTMLFormElement, e: SubmitEvent) {
  {
    e.preventDefault();
    const url = new URL(window.location.href);

    const proc_select = (src: string, dst: string) => {
      const m = (this.querySelector(src) as HTMLInputElement).value.match(
        /^(\d+)/
      );
      if (m) url.searchParams.set(dst, m[1]);
    };
    proc_select("#selectop", "op");
    proc_select("#selectbaseop", "baseop");
    proc_select("#selecttype", "type");
    proc_select("#selectjob", "job");

    for (const input of this.getElementsByTagName("input")) {
      if (input.type === "radio" || input.type === "checkbox") {
        if (input.value && input.checked) {
          url.searchParams.set(input.name, input.value);
        }
      } else if (!input.name.includes("select") && input.value) {
        url.searchParams.set(input.name, input.value);
      }
    }
    const exclude_opts = ["A", "D", "E", "G", "R"];
    if (
      exclude_opts.reduce((p, c) => p && url.searchParams.get(c) !== null, true)
    ) {
      exclude_opts.forEach((v) => url.searchParams.delete(v));
      url.searchParams.set("ADEGR", "");
    }
    storage.save();
    window.history.pushState(null, "", url.search);
    update();
  }
}

const update = async () => {
  const app = document.getElementById("app");
  if (app == null) throw new Error();
  app.textContent = "";
  app.appendChild(header());
  await router(app);
  app.appendChild(footer());
  for (const form of document.getElementsByTagName("form")) {
    form.addEventListener("submit", submit_handler);
  }
  if (isIndex()) {
    storage.apply();
  }
};

const router = async (app: HTMLElement) => {
  if (isIndex()) {
    return index(app, textdata);
  }

  const params = getParams();

  if (params.weapon) {
    return weapon(app);
  }
  if (params.protector) {
    return protector(app);
  }

  if (params.infty) {
    SEARCH_LIMIT = Infinity;
  }

  const id = params.id;
  const query = params.query;
  const not_query = params.not_query;
  const type = params.type;
  const op = params.op;
  const baseop = params.baseop;
  const rank = params.rank;
  const grade = params.grade;
  const group = params.group;
  const job = params.job;
  const lv = params.lv;

  const A = params.A;
  const D = params.D;
  const E = params.E;
  const G = params.G;
  const R = params.R;

  let hit = Object.keys(itemdata).map((e) => parseInt(e));

  const keyword = params.keyword;
  if (keyword) {
    hit = hit.filter((e) => itemtext[e]?.match(keyword));
  }

  if (id) {
    const maxid = parseInt(Object.keys(itemdata).slice(-1)[0]);
    const range = str2range(id, maxid);

    if (range.length === 1) {
      app.appendChild(render(range[0]));
      return;
    } else {
      hit = range.filter((e) => itemdata[e]);
    }
  }

  if (query) hit = hit.filter((e) => itemname[e]?.match(query));
  if (not_query) hit = hit.filter((e) => !itemname[e]?.match(not_query));
  if (type >= 0) hit = hit.filter((e) => itemdata[e]?.Type === type);
  if (op >= 0) {
    hit = hit.filter(
      (e) =>
        itemdata[e]?.OpBit.some((i) => i.Id === op) ||
        itemdata[e]?.OpNxt.some((i) => i.Id === op)
    );
  }
  if (baseop >= 0) {
    hit = hit.filter((e) => itemdata[e]?.OpPrt.some((i) => i.Id === baseop));
  }
  if (rank) {
    hit = hit.filter((e) => itemdata[e]?.Rank === rank);
  }
  if (grade) {
    hit = hit.filter((e) => itemdata[e]?.Grade === grade);
  }
  // TODO group条件見直し
  if (group === "w") {
    hit = hit.filter((e) => {
      const item = itemdata[e];
      return (
        item &&
        (item.AtParam.Range > 0 ||
          (item.Job.includes(7) &&
            ![17, 73, ...C.not_equipment].includes(item.Type)))
      );
    });
  }
  if (group === "p") {
    hit = hit.filter((e) => {
      const item = itemdata[e];
      return (
        item &&
        [...C.protector_type].includes(item.Type) &&
        (!item.Job.includes(7) || [17, 73].includes(item.Type))
      );
    });
  }
  if (group === "mw") {
    hit = hit.filter((e) => {
      const item = itemdata[e];
      return (
        item &&
        item.Job.includes(7) &&
        ![17, 22, 70, 73, ...C.not_equipment].includes(item.Type)
      );
    });
  }
  if (group === "nw") {
    hit = hit.filter((e) => {
      const item = itemdata[e];
      return (
        item &&
        item.AtParam.Range <= 0 &&
        !(
          item.Job.includes(7) &&
          ![17, 73, ...C.not_equipment].includes(item.Type)
        )
      );
    });
  }
  if (job >= 0) {
    hit = hit.filter((e) => itemdata[e]?.Job.includes(job));
  } else if (job === -1) {
    hit = hit.filter((e) => itemdata[e]?.Job.length === 0);
  } else if (job === -2) {
    hit = hit.filter((e) => itemdata[e]?.Job.length ?? 0 > 0);
  }
  if (lv) {
    const lrange = str2range(lv, C.maxlv);
    if (lrange.length === 1) {
      if (lrange[0] === 0) {
        hit = hit.filter((e) => itemdata[e]?.Require["0"] == null);
      } else {
        hit = hit.filter((e) => itemdata[e]?.Require["0"] === lrange[0]);
      }
    } else {
      hit = hit.filter(
        (e) =>
          lrange.includes(itemdata[e]?.Require?.["0"] ?? -1) ||
          (lrange.includes(0) && itemdata[e]?.Require["0"] == null)
      );
    }
  }
  if (A) {
    hit = hit.filter((e) => !itemname[e]?.includes("[A]"));
  }
  if (D) {
    hit = hit.filter((e) => !itemname[e]?.includes("[D]"));
  }
  if (E) {
    hit = hit.filter((e) => !itemname[e]?.includes("[E]"));
  }
  if (G) {
    hit = hit.filter((e) => !itemname[e]?.includes("[G]"));
  }
  if (R) {
    hit = hit.filter((e) => !itemname[e]?.includes("[R]"));
  }

  if (params.unknown) {
    const ops = Object.keys(textdata.op).map((e) => parseInt(e));
    const baseops = Object.keys(textdata.baseop).map((e) => parseInt(e));
    hit = hit.filter(
      (e) =>
        itemdata[e]?.OpPrt.filter((baseop) => !baseops.includes(baseop.Id))
          .length ||
        itemdata[e]?.OpBit.filter((op) => !ops.includes(op.Id)).length ||
        itemdata[e]?.OpNxt.filter((op) => !ops.includes(op.Id)).length
    );
  } else {
    const nxids = hit
      .filter(
        (e) =>
          itemdata[e]?.Rank !== "NX" &&
          itemdata[e]?.Id !== itemdata[e]?.NxId &&
          itemdata[e]?.NxId
      )
      .map((e) => itemdata[e]?.NxId);
    hit = hit.filter((e) => !nxids.includes(e));
  }

  const result = document.createElement("p");
  app.appendChild(result);

  let restext = "";
  if (lv === "0") {
    restext += "装備Lvなし";
  } else if (lv) {
    restext += `装備Lv${lv}`;
  }
  if (query) restext += ` 含む"${query}"`;
  if (not_query) restext += ` 含まない"${not_query}"`;
  if (type >= 0) restext += ` ${C.item_type[type]}`;
  if (op >= 0)
    restext += ` "${textdata.op[op]
      ?.replace(/<c:([^> ]+?)>(.+?)<n>/g, "$2")
      .replace(/\$func\d+/, "")}"`;
  if (baseop >= 0)
    restext += ` "${textdata.baseop[baseop]?.replace(
      /<c:([^> ]+?)>(.+?)<n>/g,
      "$2"
    )}"`;
  if (job >= 0) {
    restext += ` ${C.job_type[job]}`;
  } else if (job === -1) {
    restext += "職業制限なし";
  } else if (job === -2) {
    restext += "職業制限あり";
  }
  if (grade) restext += ` ${grade}`;
  if (rank) restext += ` ${rank}`;
  if (group === "p") restext += " 防具";
  if (group === "w") restext += " 武器";
  if (group === "nw") restext += " 武器以外";
  if (group === "mw") restext += " 手足武器";
  restext += ` ${hit.length}件`;
  if (hit.length > SEARCH_LIMIT)
    restext += ` (${SEARCH_LIMIT}件に制限しています)`;
  result.innerText = restext;

  window.scroll(0, 0);

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
    Copyright (c) L&K Co., Ltd. All Rights Reserved.
  </footer>`;
  return footer;
};

const render = (id: number) => {
  const { nodiff } = getParams();

  const item = itemdata[id] as Item;
  const nxitem =
    !nodiff && item.NxId && item.NxId !== item.Id
      ? itemdata[item.NxId]
      : undefined;

  return gen_tooltip(item, nxitem);
};

export const gen_tooltip = (item: Item, nxitem: Item | undefined) => {
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
      let opText = replaceOpText(textdata.baseop[baseop.Id], ...Value);
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
        opText = replaceOpText(option.Text, ...option.Value);
      } else if (option.Id === -1) {
        return null;
      } else {
        opText = replaceOpText(textdata.op[option.Id], ...option.Value);
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
              opText = replaceOpText(option.Text!, ...option.Value);
            } else {
              opText = replaceOpText(
                textdata.baseop[option.Id],
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
            opText = replaceOpText(option.Text!, ...option.Value);
          } else {
            opText = replaceOpText(textdata.op[option.Id], ...option.Value);
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
        opText = replaceOpText(option.Text, ...option.Value);
      } else if (option.Id === -1) {
        return null;
      } else {
        opText = replaceOpText(textdata.op[option.Id], ...option.Value);
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
