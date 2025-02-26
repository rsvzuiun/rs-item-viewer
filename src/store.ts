import {
  baseop_url,
  baseopov_url,
  itemdata_url,
  itemdatakr_url,
  itemname_url,
  itemtext_url,
  op_url,
  opov_url,
} from "./const";
import { isKr } from "./params";
import { ItemData, TextData } from "./types";

const itemdataP = fetch(isKr() ? itemdatakr_url : itemdata_url).then((r) =>
  r.json()
);
const baseopP = fetch(baseop_url).then((r) => r.json());
const baseopovP = fetch(baseopov_url).then((r) => r.json());
const opP = fetch(op_url).then((r) => r.json());
const opovP = fetch(opov_url).then((r) => r.json());
const itemnameP = fetch(itemname_url).then((r) => r.json());
const itemtextP = fetch(itemtext_url).then((r) => r.json());

const itemdata: ItemData = await itemdataP;
const itemname: string[] = await itemnameP;
const itemtext: string[] = await itemtextP;
const _baseop = await baseopP;
const textdata: TextData = {
  baseop: { ..._baseop, ...(await baseopovP) },
  op: { ..._baseop, ...(await opP), ...(await opovP) },
};
const state = { abort_render: false };
export { itemdata, itemname, itemtext, state, textdata };
