// @ts-check
/* global version, itemdata_url, textdata_url, status_type, extra_status_type,
job_type, item_type, not_equipment, type_categories, engraved */
/// <reference path="./const.js" />
/// <reference path="./engraved.js" />

/**
 * @typedef {{
 *   Id: number,
 *   ImageId: number,
 *   NxId: number,
 *   Type: number,
 *   Name: string,
 *   Rank: string,
 *   Grade: string,
 *   AtParam: {Range: number, Speed: number, Min: number, Max: number},
 *   Food: number,
 *   ValueTable: number[][],
 *   OpPrt: {Id: number, ValueIndex: number[]}[],
 *   OpBit: {Id: number, Value: number[]}[],
 *   OpNxt: {Id: number, Value: number[]}[],
 *   Require: {[key: string]: number | object,
 *   Extra: {StatusType: number, MulValue: number, ValueIndex: number}},
 *   Job: number[],
 *   Text: string,
 *   StackSize: number,
 *   Durability: number,
 *   DropLv: number,
 *   DropFactor: number,
 *   Price: number,
 *   PriceType: number,
 *   PriceFactor: number,
 *   Flags: string,
 * }} Item
 * @type {Array<Item>}
 */
let itemdata = undefined;

/** @type {{OptionProper: ArrayLike<string>, OptionBasic: ArrayLike<string>}} */
let textdata = undefined;

let SEARCH_LIMIT = 2000;

document.addEventListener('DOMContentLoaded', async () => {
  [itemdata, textdata] = await Promise.all(
    [itemdata_url, textdata_url].map(
      url => fetch(url).then(response => response.json())
    ));
  customElements.define('spa-anchor', SPAAnchor, { extends: 'a' });
  window.addEventListener('popstate', () => {
    update();
  });
  update();
  for (const form of document.getElementsByTagName('form')) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = new URL(window.location.href);
      for (const input of form.getElementsByTagName('input')) {
        if ((input.type === 'radio' && input.value && input.checked)
            || (input.type !== 'radio' && input.name && input.value)) {
          url.searchParams.set(input.name, input.value);
        }
      }
      window.history.pushState(null, '', url.search);
      update();
    });
  }
});

const update = async () => {
  const app = document.getElementById('app');
  app.textContent = '';
  app.appendChild(header());
  app.appendChild(router());
  app.appendChild(footer());
};

const router = () => {
  const params = (new URL(window.location.href)).searchParams;

  if (params.toString() === '') {
    return index();
  }

  const hidden = params.get('oo');
  if (hidden) { SEARCH_LIMIT = Infinity; }

  const id = params.get('id');
  const query = params.get('q');
  const not_query = params.get('nq');
  const type = parseInt(params.get('type'));
  const op = parseInt(params.get('op'));
  const baseop = parseInt(params.get('baseop'));
  const rank = params.get('rank');
  const grade = params.get('grade');
  const group = params.get('group');
  const job = parseInt(params.get('job'));

  const frag = document.createDocumentFragment();
  let hit = itemdata;

  if (id) {
    const m = id.match(/^(\d+)(-)?(\d+)?$/);
    if (m) {
      if (m[3]) { // begin-end
        hit = hit.filter(e => parseInt(m[1]) <= e.Id && e.Id <= parseInt(m[3]))
      } else if (m[2]) { // begin-
        hit = hit.filter(e => parseInt(m[1]) <= e.Id)
      } else if (m[1]) { // id
        return render(parseInt(m[1]));
      }
    }
  }

  if (query) hit = hit.filter(e => e.Name.match(query));
  if (not_query) hit = hit.filter(e => !e.Name.match(not_query));
  if (type >= 0) hit = hit.filter(e => e.Type === type);
  if (op >= 0) {
    hit = hit.filter(e => 
      e.OpBit.some(i => i.Id === op) || e.OpNxt.some(i => i.Id === op)
    );
  }
  if (baseop >= 0) {
    hit = hit.filter(e => e.OpPrt.some(i => i.Id === baseop));
  }
  if ((!op || !baseop) && rank !== 'NX') {
    hit = hit.filter(e => e.Rank !== 'NX');
  }
  if (rank) {
    hit = hit.filter(e => e.Rank === rank);
  }
  if (grade) {
    hit = hit.filter(e => e.Grade === grade);
  }
  if (group === 'w') {
    hit = hit.filter(e => e.AtParam.Range > 0);
  }
  if (group === 'nw') {
    hit = hit.filter(e => e.AtParam.Range <= 0);
  }
  if (job >= 0) {
    hit = hit.filter(e => e.Job.includes(job));
    // hit = hit.filter(e => !e.Job.length || e.Job.includes(job));
  }
  const result = document.createElement('p');
  frag.appendChild(result);

  let restext = '';
  if (query) restext += ` 含む"${query}"`;
  if (not_query) restext += ` 含まない"${not_query}"`;
  if (type >= 0) restext += ` ${item_type[type]}`;
  if (op >= 0) restext += ` "${textdata.OptionBasic[op]?.replace(/<c:([^> ]+?)>(.+?)<n>/g, '$2')}"`;
  if (baseop >= 0) restext += ` "${textdata.OptionProper[baseop]?.replace(/<c:([^> ]+?)>(.+?)<n>/g, '$2')}"`;
  if (job >= 0) restext += ` ${job_type[job]}`;
  if (rank) restext += ` ${rank}`;
  if (grade) restext += ` ${grade}`;
  if (group === 'w') restext += ' 武器';
  if (group === 'nw') restext += ' 武器以外';
  restext += ` ${hit.length}件`;
  if (hit.length > SEARCH_LIMIT)
    restext += ` (${SEARCH_LIMIT}件に制限しています)`;
  result.innerText = restext;

  hit.slice(0, SEARCH_LIMIT).map((item) => {
    frag.appendChild(render(item.Id));
  });

  return frag;
};

const index = () => {
  const root = document.createDocumentFragment();
  const form = document.createElement('form');
  root.appendChild(form);
  form.action = '.';
  form.method = 'get';
  form.innerHTML = `
<label for='q'>キーワード:</label>
  <input type='text' name='q' id='q' />
  <br />
<label for='type'>部位: </label>
  <input type='text' id='selecttype' list='selecttype-list' />
  <datalist id='selecttype-list'></datalist>
  <input type='hidden' id='type' name='type' />
  <br />
<label for='selectop'>オプション:</label>
  <input type='text' id='selectop' list='selectop-list' />
  <datalist id='selectop-list'></datalist>
  <input type='hidden' id='op' name='op' />
  <br />
<label for='selectjob'>職業:</label>
  <input type='text' id='selectjob' list='selectjob-list' />
  <datalist id='selectjob-list'></datalist>
  <input type='hidden' id='job' name='job' />
  <br />
<label for='rank'>等級</label>
  <input type='radio' name='rank' value='' checked='checked'>全て</input>
  <input type='radio' name='rank' value='N'>N</input>
  <input type='radio' name='rank' value='U'><img src='img/ui/type-icon-U.gif' /></input>
  <input type='radio' name='rank' value='NX'><img src='img/ui/type-icon-NX.gif' /></input>
  <br />
<label for='grade'>等級</label>
  <input type='radio' name='grade' value='' checked='checked'>全て</input>
  <input type='radio' name='grade' value='N'>N</input>
  <input type='radio' name='grade' value='DX'><img src='img/ui/type-icon-DX.gif' /></input>
  <input type='radio' name='grade' value='UM'><img src='img/ui/type-icon-UM.gif' /></input>
  <br />
<label for='group'>フィルタ:</label>
  <input type='radio' name='group' value='' checked='checked'>全て</input>
  <input type='radio' name='group' value='w'>武器</input>
  <input type='radio' name='group' value='nw'>武器以外</input>
  <br />
<button type='submit'>検索</button>
  `;
  const selectoplist = form.querySelector('#selectop-list');
  for (const [k, v] of Object.entries(textdata.OptionBasic)) {
    const option = document.createElement('option');
    option.value = `${k}: ${v.replace(/<c:([^> ]+?)>(.+?)<n>/g, '$2')}`;
    selectoplist.appendChild(option);
  }
  form.appendChild(selectoplist);

  form.querySelector('#selectop').addEventListener('change', (e) => {
    // @ts-ignore
    const m = e.target.value.match(/^(\d+)/);
    // @ts-ignore
    if (m) document.getElementById('op').value = m[1];
  });

  const selecttypelist = form.querySelector('#selecttype-list');
  for (const [k, v] of Object.entries(item_type)) {
    if (not_equipment.includes(parseInt(k))) continue;
    const option = document.createElement('option');
    option.value = `${k}: ${v}`;
    selecttypelist.appendChild(option);
  }
  form.appendChild(selecttypelist);
  form.querySelector('#selecttype').addEventListener('change', (e) => {
    // @ts-ignore
    const m = e.target.value.match(/^(\d+)/);
    // @ts-ignore
    if (m) document.getElementById('type').value = m[1];
  });

  const selectjoblist = form.querySelector('#selectjob-list');
  for (const [k, v] of Object.entries(job_type)) {
    if (k === '40' || k === '41') continue;
    const option = document.createElement('option');
    option.value = `${k}: ${v}`;
    selectjoblist.appendChild(option);
  }
  form.appendChild(selectjoblist);
  form.querySelector('#selectjob').addEventListener('change', (e) => {
    // @ts-ignore
    const m = e.target.value.match(/^(\d+)/);
    // @ts-ignore
    if (m) document.getElementById('job').value = m[1];
  });

  const build = (groups) => {
    const frag = document.createDocumentFragment();
    for (let value of groups) {
      const child = document.createElement('div');
      frag.appendChild(child);
      if (typeof(value[0]) === 'string') {
        const head = document.createElement('h2');
        head.innerText = value[0];
        child.className = 'index-frame';
        child.appendChild(head);
        child.appendChild(build(value.slice(1)));
      } else {
        for (let i of value) {
          const image = document.createElement('div');
          image.className = 'index-image';
          image.innerHTML = `<a is='spa-anchor' href='?type=${i}'><img src='img/type/${i}.png' /><br />${item_type[i]}</a>`;
          child.appendChild(image);
        }
      }
    }
    return frag;
  };
  root.appendChild(build(type_categories));
  return root;
};

const header = () => {
  const header = document.createElement('div');
  header.innerHTML = `
  <a is='spa-anchor' href='.'>[戻る]</a>
  `;
  return header;
};

const footer = () => {
  const footer = document.createElement('div');
  footer.innerHTML = `
  <hr />
  <div><a href="https://github.com/rsvzuiun/rs-item-viewer">[CODE]</a> ${version}</div>
  <footer>
    当サイトで利用している画像及びデータは、株式会社ゲームオンに帰属します。<br />
    許可無くご利用又は転用になられる事は出来ませんので、予めご了承下さい。<br />
    Copyright (c) L&K Co., Ltd. All Rights Reserved. License to GameOn Co., Ltd.
  </footer>`;
  return footer;
};

/** @param {number} id */
const render = (id) => {
  const item = itemdata.find(e => e.Id == id);
  const nxitem = (item.NxId && item.NxId !== item.Id)
                  ? itemdata.find(e => e.Id == item.NxId) : undefined;

  const tooltip = document.createElement('div');
  if (item.Rank === 'NX') {
    tooltip.className = 'tooltip border-nx';
  } else {
    tooltip.className = 'tooltip border-normal';
  }

  {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    const anchor = document.createElement('a', {is: 'spa-anchor'});
    row.appendChild(anchor);
    anchor.href = `?id=${id}`;
    const image = document.createElement('div');
    anchor.appendChild(image);
    image.className = 'image';

    if (item.ImageId >= 0){
      image.insertAdjacentHTML('beforeend',
      `<img src="img/item/${item.ImageId}.png" width="34" height="34" />`);
    }

    if (item.Rank !== 'N') {
      image.insertAdjacentHTML('beforeend',
      `<img class="rank" src="img/ui/type-icon-${item.Rank}.gif" />`);
    }
    if (item.Grade !== 'N') {
      image.insertAdjacentHTML('beforeend',
      `<img class="grade" src="img/ui/type-icon-${item.Grade}.gif" />`);
    }
  }
  {
    const row = document.createElement('div');
    tooltip.appendChild(row);
    row.className = 'name';

    const item_name = document.createElement('span');
    row.appendChild(item_name);
    item_name.innerHTML = replaceColorTag(item.Name);
    if (item.Rank !== 'N') {
      item_name.className = 'item-name-' + item.Rank;
    }
    if (nxitem && (item.Name !== nxitem.Name)) {
      row.classList.add('item-different-line');
    }
  }
  if (item.AtParam.Max || item.OpPrt.length || item.OpBit.length){
    {
      const row = document.createElement('div');
      tooltip.appendChild(row);

      row.className = 'label';
      row.innerText = '<基本情報>';
    }
    if (!not_equipment.includes(item.Type)) {
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerText = '- ' + item_type[item.Type];
    }
    if (item.Flags.includes('<取引不可>')) {
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag(
        '<c:CTPURPLE>- 取引不可アイテム<n>');
    }
    if (item.Flags.includes('<銀行取引不可>')) {
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag(
        '<c:CTPURPLE>- 銀行取引不可<n>');
    }
  }
  {
    const atmin = item.AtParam.Min || 0;
    const atmax = item.AtParam.Max || 0;
    const speed = item.AtParam.Speed || 0;

    if (atmin !== 0 || atmax !== 0) {
      const row = document.createElement('div');
      tooltip.appendChild(row);

      let html = `- 攻撃力 <span class='text-color-LTYELLOW'>${atmin}~${atmax}</span>`;
      if (speed) {
        html += ` (<span class='text-color-LTYELLOW'>${(speed/100).toFixed(2)}</span>秒)`;
      }
      row.innerHTML = html;
      if (nxitem && !equals(item.AtParam, nxitem.AtParam)) {
        row.className = 'item-different-line';
      }
    }
  }
  {
    const range = item.AtParam.Range || 0;
    if (range !== 0) {
      const html = `- 射程距離 <span class='text-color-LTYELLOW'>${range}</span>`;
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerHTML = html;
      if (nxitem && item.AtParam.Range !== nxitem.AtParam.Range) {
        row.className = 'item-different-line';
      }
    }
  }
  {
    item.OpPrt.map((baseop, idx) => {
      if (baseop.Id === -1) return null;

      const row = document.createElement('div');

      const Value = opPrtValue(item, idx);
      let opText = replaceOpText(textdata.OptionProper[baseop.Id], ...Value);
      if (!opText) return null;
      if (opText === 'undefined') {
        opText = `&lt;unknown_base id=${baseop.Id} value=[${Value}]&gt;`;
      }
      row.innerHTML = '- ' + opText;
      if (nxitem && (
             item.OpPrt[idx].Id !== nxitem.OpPrt[idx].Id
          || !equals(Value, opPrtValue(nxitem, idx))
          )) {
        row.className = 'item-different-line';
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  {
    item.OpBit.map((option, idx) => {
      if (option.Id === -1) return null;

      const row = document.createElement('div');

      let opText = replaceOpText(textdata.OptionBasic[option.Id], ...option.Value);
      if (opText === '') return null;
      if (opText === 'undefined') {
        opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
      }
      row.innerHTML = '- ' + opText;
      if (nxitem && !equals(item.OpBit[idx], nxitem.OpBit[idx])) {
        row.className = 'item-different-line';
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  if (nxitem && item.OpBit.length < nxitem.OpBit.length) {
    for (let i=0; i<nxitem.OpBit.length-item.OpBit.length; i++){
        const row = document.createElement('div');
      row.className = 'text-color-GRAY item-different-line';
      row.innerText = '- なし';
      tooltip.appendChild(row);
    }
  }
  if (item?.OpPrt[0]?.Id === 773) {
    const q = item.OpBit.find(e => e.Id === 774);
    try {
      const [setid, equipid] = q.Value;

      const label = document.createElement('div');
      tooltip.appendChild(label);

      label.className = 'label';
      label.innerText = engraved[setid] ? `<刻印 - ${
        engraved[setid].name
      }[${
        engraved[setid][equipid].name
      }]>` : `<刻印 - #${setid}>`;

      {
        const row = document.createElement('div');
        tooltip.appendChild(row);
        row.innerHTML = replaceColorTag(
          '<c:CTPURPLE>- 同じ刻印装備の着用制限<n> <c:LTYELLOW>0/1<n>');
      }
      {
        const row = document.createElement('div');
        tooltip.appendChild(row);
        row.innerText = '- レベル 30';
      }
      if (engraved[setid]) {
        engraved[setid][equipid].op.map(option => {
          const row = document.createElement('div');

          let opText = '';
          if (option.Id === -1) {
            opText = replaceOpText(option.Text, ...option.Value);
          } else {
            opText = replaceOpText(textdata.OptionBasic[option.Id], ...option.Value);
            if (!opText) return null;
            if (opText === 'undefined') {
              opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
            }
          }
          row.innerHTML = '- ' + opText;
          return row;
        }).filter(v => v).map(elm => tooltip.appendChild(elm));
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (nxitem || item.Rank === 'NX') {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<錬成 オプション 情報>';
  }
  if (item.Rank === 'NX') {
    item.OpNxt.map(option => {
      if (option.Id === -1) return null;

      const row = document.createElement('div');

      let opText = replaceOpText(textdata.OptionBasic[option.Id], ...option.Value);
      if (!opText) return null;
      if (opText === 'undefined') {
        opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
      }
      row.innerHTML = '- ' + opText;
      if (nxitem) {
        row.className = 'item-different-line';
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  if (nxitem && item.Rank !== 'NX') {
    for (let i=0; i<4; i++){
      const row = document.createElement('div');
      row.className = 'text-color-GRAY item-different-line';
      row.innerText = '- なし';
      tooltip.appendChild(row);
    }
  }
  {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<説明>';
  }
  {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.innerHTML = '- ' + replaceTextData(item.Text);
  }
  if (Object.keys(item.Require).length) {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<要求能力値>';
  }
  {
    Object.keys(item.Require).map(key => {
      const value = item.Require[key];
      const row = document.createElement('div');
      if (key !== 'Extra') {
        const html = `- ${status_type[key]} <span class='text-color-LTYELLOW'>${value}</span>`;
        row.innerHTML = html;
      } else {
        const base = item.ValueTable[value.ValueIndex];
        const html = `- ${extra_status_type[value.StatusType]}
        <span class='text-color-LTYELLOW'>${value.MulValue} * [${base[0]}~${base[1]}]</span>`;
        row.innerHTML = html;
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  if (item.Job.length){
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<着用/使用可能な職業>';
  }
  {
    item.Job.map(job => {
      const row = document.createElement('div');
      row.innerHTML = '- ' + job_type[job];
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<システム情報>';

    const Id = document.createElement('div');
    tooltip.appendChild(Id);
    Id.innerHTML = `- ID ${yellow(item['Id'])}`;

    if (item['StackSize'] !== 1) {
      const StackSize = document.createElement('div');
      tooltip.appendChild(StackSize);
      StackSize.innerHTML = `- 重ね置き ${yellow(item['StackSize'])}`;
    }

    if (item['Grade'] !== 'N') {
      const Durability = document.createElement('div');
      tooltip.appendChild(Durability);
      Durability.innerHTML = `- 耐久減少 ${yellow(item['Durability'])}型`;
    }

    const DropLv = document.createElement('div');
    tooltip.appendChild(DropLv);
    DropLv.innerHTML = `- ドロップレベル ${yellow(item['DropLv'])}`;

    const DropFactor = document.createElement('div');
    tooltip.appendChild(DropFactor);
    DropFactor.innerHTML = `- ドロップ係数 ${yellow(item['DropFactor'])}`;

    const Price = document.createElement('div');
    tooltip.appendChild(Price);
    Price.innerHTML = `- 価格 ${
      yellow(Math.floor(item['Price']*item['PriceFactor']/100).toLocaleString())
    } Gold`;

    const Flags = document.createElement('div');
    tooltip.appendChild(Flags);
    Flags.innerHTML = `- Flags ${yellow(item['Flags'])}`;
  }

  if (nxitem && item.Rank !== 'NX') {
    const root = document.createElement('div');
    root.className = 'nx-pair';
    root.appendChild(tooltip);
    root.appendChild(render(item.NxId));
    return root;
  } else {
    return tooltip;
  }
};

/** @param {object} a, @param {object} b */
const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** @param {string | number} text */
const yellow = (text) => `<span class='text-color-LTYELLOW'>${text}</span>`;

/** @param {string} text, @param  {...string|number} args */
function replaceOpText(text, ...args) {
  text = String(text)
  .replace(/\r\n/g, '<br />')
  .replace('スキルレベル [+0]([1]系列 職業)',
    `<c:LTYELLOW>${job_type[args[1]]}<n> スキルレベル [+0]`)
  .replace(/\[([+-]?)([0-7])\](0*％?)/g, (org, sign, opid, post) => {
    return yellow(`${sign}${args[parseInt(opid)]}${post}`);
  });
  return replaceColorTag(text);
}

/** @param {string} text */
const replaceTextData = (text) => {
  return replaceColorTag(String(text).replace(/\r\n/g, "<br />"));
};

/** @param {string} text */
const replaceColorTag = (text) => {
  return text.replace(/<c:([^> ]+?)>(.+?)<n>/g,
  (string, matched1, matched2) => {
    return `<span class='text-color-${matched1}'>${matched2}</span>`;
  });
};

/** @param {Item} item, @param {number} idx */
const opPrtValue = (item, idx) => {
  return item.OpPrt[idx].ValueIndex.map(index => {
    const min = item.ValueTable[index][0];
    const max = item.ValueTable[index][1];
    if (min === max) return min;
    return `[${min}~${max}]`;
  });
};

class SPAAnchor extends HTMLAnchorElement {
  constructor() {
    super();
    /** @type {(this: GlobalEventHandlers, ev: MouseEvent) => any} */
    this.onclick = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', this.href);
      update();
    };
  }
}
