import * as C from "../const";
import { itemdata, itemname, itemtext, textdata, state } from "../store";
import { str2range } from "../util";
import { getParams } from "../params";
import { tooltip } from "../components/tooltip";

export const search = async (app: HTMLElement) => {
  const params = getParams();

  const SEARCH_LIMIT = params.infty ? Infinity : C.SEARCH_LIMIT;

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
      app.appendChild(tooltip(range[0]));
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

  state.abort_render = false;
  for await (const e of hit.slice(0, SEARCH_LIMIT)) {
    if (state.abort_render) break;
    app.appendChild(tooltip(e));
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};
