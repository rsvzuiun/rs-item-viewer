// @ts-check
/* global version, itemdata_url, textdata_url, status_type, extra_status_type,
job_type, item_type, not_equipment, type_categories, engraved */
/// <reference path="./const.js" />
/// <reference path="./engraved.js" />
/// <reference path="./form-storage.js" />

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
 *   OpBit: {Id: number, Value: number[], Text}[],
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
 *   Extra: number,
 * }} Item
 * @type {{[id: number]: Item}}
 */
let itemdata = undefined;

/** @type {{OptionProper: ArrayLike<string>, OptionBasic: ArrayLike<string>}} */
let textdata = undefined;

let SEARCH_LIMIT = 2000;

let storage = undefined;

let aborted = false;

document.addEventListener('DOMContentLoaded', async () => {

  if ((new URL(window.location.href)).searchParams.get('kr')) {
    itemdata_url = 'data/itemData-kr.json'
    document.body.lang = 'kr'
  } else {
    itemdata_url = 'data/itemData.json'
  }

  [itemdata, textdata] = await Promise.all(
    [itemdata_url, textdata_url].map(
      url => fetch(url).then(response => response.json())
    ));
  customElements.define('spa-anchor', SPAAnchor, { extends: 'a' });
  window.addEventListener('popstate', async () => {
    aborted = true;
    await new Promise(resolve => setTimeout(resolve, 0));
    update();
  });
  update();
});

const update = async () => {
  const app = document.getElementById('app');
  app.textContent = '';
  app.appendChild(header());
  await router(app);
  app.appendChild(footer());
  for (const form of document.getElementsByTagName('form')) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = new URL(window.location.href);

      const proc_select = (src, dst) => {
        const m = form.querySelector(src).value.match(/^(\d+)/);
        if (m) url.searchParams.set(dst, m[1]);
      };
      proc_select('#selectop', 'op');
      proc_select('#selecttype', 'type');
      proc_select('#selectjob', 'job');

      for (const input of form.getElementsByTagName('input')) {
        if (input.type === 'radio' || input.type === 'checkbox') {
          if (input.value && input.checked) {
            url.searchParams.set(input.name, input.value);
          }
        } else if (!input.name.includes('select') && input.value) {
          url.searchParams.set(input.name, input.value);
        }
      }
      storage.save();
      window.history.pushState(null, '', url.search);
      update();
    });
  }
  if ((new URL(window.location.href)).searchParams.toString() === '') {
    // @ts-ignore
    storage = new FormStorage('form', {
      name: 'rs-item-viewer',
      ignores: [
        '[type="hidden"]'
      ]
    });
    storage.apply();
  }
};

const router = async (app) => {
  const params = (new URL(window.location.href)).searchParams;

  if (params.get('sandbox')) {
    return sandbox(app);
  }

  if (params.toString() === '') {
    return index(app);
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
  const lv = parseInt(params.get('lv'));

  const A = params.get('A');
  const D = params.get('D');
  const E = params.get('E');
  const G = params.get('G');
  const R = params.get('R');

  // const frag = document.createDocumentFragment();
  let hit = Object.keys(itemdata).map(e => parseInt(e));

  const keyword = params.get("keyword");
  if (keyword) {
    hit = hit.filter(e => itemdata[e].Text.match(keyword));
  }

  if (id) {
    const maxid = parseInt(Object.keys(itemdata).slice(-1)[0]);
    const range = new Set(id.split(',').map(e => {
      const m = e.match(/^(\d+)(-)?(\d+)?$/);
      if (m) {
        if (m[3]) { // begin-end
          const min = parseInt(m[1]);
          const max = parseInt(m[3]);
          return [...Array(max - min + 1)].map((v,i) => i+min);
        } else if (m[2]) { // begin-
          const min = parseInt(m[1]);
          return [...Array(maxid - min + 1)].map((v,i) => i+min);
        } else if (m[1]) { // id
          return parseInt(m[1])
        }
      }
    }).flat());

    if (range.size === 1) {
      app.appendChild(render([...range.keys()][0]));
      return;
      // return render([...range.keys()][0]);
    } else {
      hit = [...range.keys()].filter(e => itemdata[e]);
    }
  }

  if (query) hit = hit.filter(e => itemdata[e].Name.match(query));
  if (not_query) hit = hit.filter(e => !itemdata[e].Name.match(not_query));
  if (type >= 0) hit = hit.filter(e => itemdata[e].Type === type);
  if (op >= 0) {
    hit = hit.filter(e =>
      itemdata[e].OpBit.some(i => i.Id === op) || itemdata[e].OpNxt.some(i => i.Id === op)
    );
  }
  if (baseop >= 0) {
    hit = hit.filter(e => itemdata[e].OpPrt.some(i => i.Id === baseop));
  }
  if (rank) {
    hit = hit.filter(e => itemdata[e].Rank === rank);
  }
  if (grade) {
    hit = hit.filter(e => itemdata[e].Grade === grade);
  }
  if (group === 'w') {
    hit = hit.filter(e => {
      const item = itemdata[e]
      return (item.AtParam.Range > 0)
              || (item.Job.includes(7) && ![17, 50, 59, 73].includes(item.Type))
    });
  }
  if (group === 'nw') {
    hit = hit.filter(e => {
      const item = itemdata[e]
      return (item.AtParam.Range <= 0)
              && !(item.Job.includes(7) && ![17, 50, 59, 73].includes(item.Type))
    });
  }
  if (job >= 0) {
    hit = hit.filter(e => itemdata[e].Job.includes(job));
  } else if (job === -1) {
    hit = hit.filter(e => itemdata[e].Job.length === 0);
  } else if (job === -2) {
    hit = hit.filter(e => itemdata[e].Job.length > 0);
  }
  if (lv > 0) {
    hit = hit.filter(e => itemdata[e].Require['0'] === lv);
  } else if (lv === 0) {
    hit = hit.filter(e => itemdata[e].Require['0'] == null);
  }
  {
    const nxids = hit.filter(e =>
      itemdata[e].Rank !== 'NX'
      && itemdata[e].Id !== itemdata[e].NxId
      && itemdata[e].NxId)
      .map(e => itemdata[e].NxId);
    hit = hit.filter(e => !nxids.includes(e))
  }
  if (A) {
    hit = hit.filter(e => !itemdata[e].Name.includes('[A]'))
  }
  if (D) {
    hit = hit.filter(e => !itemdata[e].Name.includes('[D]'))
  }
  if (E) {
    hit = hit.filter(e => !itemdata[e].Name.includes('[E]'))
  }
  if (G) {
    hit = hit.filter(e => !itemdata[e].Name.includes('[G]'))
  }
  if (R) {
    hit = hit.filter(e => !itemdata[e].Name.includes('[R]'))
  }
  const result = document.createElement('p');
  app.appendChild(result);

  let restext = '';
  if (query) restext += ` ??????"${query}"`;
  if (not_query) restext += ` ????????????"${not_query}"`;
  if (type >= 0) restext += ` ${item_type[type]}`;
  if (op >= 0) restext += ` "${textdata.OptionBasic[op]?.replace(/<c:([^> ]+?)>(.+?)<n>/g, '$2')}"`;
  if (baseop >= 0) restext += ` "${textdata.OptionProper[baseop]?.replace(/<c:([^> ]+?)>(.+?)<n>/g, '$2')}"`;
  if (job >= 0) restext += ` ${job_type[job]}`;
  if (rank) restext += ` ${rank}`;
  if (grade) restext += ` ${grade}`;
  if (group === 'w') restext += ' ??????';
  if (group === 'nw') restext += ' ????????????';
  restext += ` ${hit.length}???`;
  if (hit.length > SEARCH_LIMIT)
    restext += ` (${SEARCH_LIMIT}???????????????????????????)`;
  result.innerText = restext;

  aborted = false;
  for await (const e of hit.slice(0, SEARCH_LIMIT)) {
    if (aborted) break;
    app.appendChild(render(e));
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // return frag;
};

const sandbox = (app) => {
  const root = document.createElement('div');
  root.innerHTML = `
<textarea id='json' style='width: 80%; height: 30em'>{
  "Id": -1,
  "ImageId": 293,
  "NxId": 0,
  "Type": 35,
  "Name": "????????????",
  "Rank": "N",
  "Grade": "N",
  "AtParam": {
    "Range": 0,
    "Speed": 0,
    "Min": 0,
    "Max": 0
  },
  "Food": 0,
  "ValueTable": [
    [
      40,
      40
    ],
    [
      0,
      0
    ]
  ],
  "OpPrt": [],
  "OpBit": [],
  "OpNxt": [],
  "Require": {},
  "Job": [],
  "Text": "??????",
  "Extra": 0
}</textarea>
<button onclick="
o=document.getElementById('output');o.textContent='';try{o.appendChild(gen_tooltip(JSON.parse(document.getElementById('json').value)))}catch(e){o.textContent=e}

">conv</button>
<div id='output'></div>
  `;
  // return root;
  app.appendChild(root);
};

const index = (app) => {
  const root = document.createDocumentFragment();
  const form = document.createElement('form');
  root.appendChild(form);
  form.action = '.';
  form.method = 'get';
  form.innerHTML = `
<label for='q'>???????????????:</label>
  <input type='text' name='q' id='q' /><br />
  (<a target='_blank' href='https://userweb.mnet.ne.jp/nakama/'>????????????</a>??????????????? ???:
  <a is='spa-anchor' href='?q=%5E???.%2B???%24'>^???.+???$</a>
  <a is='spa-anchor' href='?q=???????????????%7C??????'>???????????????|??????</a>
  )
  <br />
<label for='selecttype'>??????: </label>
  <input type='text' id='selecttype' name='selecttype' list='selecttype-list' />
  <datalist id='selecttype-list'></datalist>
  <br />
<label for='selectop'>???????????????:</label>
  <input type='text' id='selectop' name='selectop' list='selectop-list' />
  <datalist id='selectop-list'></datalist>
  <br />
<label for='selectjob'>??????:</label>
  <input type='text' id='selectjob' name='selectjob' list='selectjob-list' />
  <datalist id='selectjob-list'></datalist>
  <br />
??????:
  <input type='radio' name='rank' id='rank-all' value='' checked='checked' /><label for='rank-all'>??????</label>
  <input type='radio' name='rank' id='rank-N' value='N' /><label for='rank-N'>N</label>
  <input type='radio' name='rank' id='rank-U' value='U' /><label for='rank-U'><img src='img/ui/type-icon-U.gif' /></label>
  <input type='radio' name='rank' id='rank-NX' value='NX' /><label for='rank-NX'><img src='img/ui/type-icon-NX.gif' /></label>
  <br />
<label for='grade'>??????:</label>
  <input type='radio' name='grade' id='grade-all' value='' checked='checked' /><label for='grade-all'>??????</label>
  <input type='radio' name='grade' id='grade-N' value='N' /><label for='grade-N'>N</label>
  <input type='radio' name='grade' id='grade-DX' value='DX' /><label for='grade-DX'><img src='img/ui/type-icon-DX.gif' /></label>
  <input type='radio' name='grade' id='grade-UM' value='UM' /><label for='grade-UM'><img src='img/ui/type-icon-UM.gif' /></label>
  <br />
<label for='group'>????????????:</label>
  <input type='radio' name='group' id='group-all' value='' checked='checked' /><label for='group-all'>??????</label>
  <input type='radio' name='group' id='group-w' value='w' /><label for='group-w'>??????</label>
  <input type='radio' name='group' id='group-nw' value='nw' /><label for='group-nw'>????????????</label>
  <br />
<label>????????????:</label>
  <input type='checkbox' id='A' name='A' value='1' /><label for='A'>[A]</label>
  <input type='checkbox' id='D' name='D' value='1' /><label for='D'>[D]</label>
  <input type='checkbox' id='E' name='E' value='1' /><label for='E'>[E]</label>
  <input type='checkbox' id='G' name='G' value='1' /><label for='G'>[G]</label>
  <input type='checkbox' id='R' name='R' value='1' /><label for='R'>[R]</label>
  <br />
<button type='submit'>??????</button> <button type='reset' onclick='storage.clear();'>?????????</button>
  `;

  const selectoplist = form.querySelector('#selectop-list');
  for (const [k, v] of Object.entries(textdata.OptionBasic)) {
    const option = document.createElement('option');
    option.value = `${k}: ${v.replace(/<c:([^> ]+?)>(.+?)<n>/g, '$2')}`;
    selectoplist.appendChild(option);
  }
  form.appendChild(selectoplist);

  const selecttypelist = form.querySelector('#selecttype-list');
  for (const [k, v] of Object.entries(item_type)) {
    if (not_equipment.includes(parseInt(k))) continue;
    const option = document.createElement('option');
    option.value = `${k}: ${v}`;
    selecttypelist.appendChild(option);
  }
  form.appendChild(selecttypelist);

  const selectjoblist = form.querySelector('#selectjob-list');
  for (const [k, v] of Object.entries(job_type)) {
    if (k === '40' || k === '41') continue;
    const option = document.createElement('option');
    option.value = `${k}: ${v}`;
    selectjoblist.appendChild(option);
  }
  form.appendChild(selectjoblist);

  const link = document.createElement('div');
  root.appendChild(link);
  link.innerHTML = `
<a is='spa-anchor' href='?lv=775&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=UM&rank=U&group=w'>775UMU??????</a>
<a is='spa-anchor' href='?lv=800&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=DX&rank=U&group=w'>800DXU??????</a>
<a is='spa-anchor' href='?lv=1000&grade=UM&rank=U&group=w'>1000UMU??????</a>
<a is='spa-anchor' href='?q=%5E%28%E3%83%96%E3%83%AC%E3%82%A4%E3%83%96%7C%E3%83%AD%E3%82%A6%E3%83%90%E3%82%B9%E3%83%88%7C%E3%82%A4%E3%83%B3%E3%83%86%E3%83%AA%29&group=w'>?????????????????????????????????????????????</a>
<a is='spa-anchor' href='?q=%5E%28%E3%82%AF%E3%83%AD%E3%82%A6%7C%E3%82%B7%E3%83%A3%E3%82%A4%E3%82%A8%E3%83%B3%29'>???????????????????????????</a>
<a href='?id=11846-11933,12107-12110'>1100DXU??????</a>
<br />
<a is='spa-anchor' href='?id=8285-8301'>BFU??????</a>
<a is='spa-anchor' href='?q=%5C%5B%E9%81%BA%E7%89%A9%5C%5D'>??????</a>
<a is='spa-anchor' href='?lv=775&id=9122-&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=UM&rank=U&group=nw'>775UMU??????</a>
<a is='spa-anchor' href='?lv=800&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=DX&rank=U&group=nw'>800DXU??????</a>
<a is='spa-anchor' href='?lv=1000&grade=UM&rank=U&group=nw'>1000UMU??????</a>
<a is='spa-anchor' href='?id=11934-11975'>1100DXU??????</a>
<a is='spa-anchor' href='?id=11976-12023,12155-12158'>1000UMU??????</a>
  `;

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
  const link_foot = document.createElement('div');
  root.appendChild(link_foot);
  link_foot.innerHTML = `
<a is='spa-anchor' href='?id=4802-4815'>?????????</a>
<a is='spa-anchor' href='?lv=680&grade=DX&rank=U'>?????????</a>
<a is='spa-anchor' href='?id=3626-3639,5651-5653,6403-6404,6939'>??????</a>
<a is='spa-anchor' href='?q=?????????????????????.*%27'>IFULT</a>
/
<a is='spa-anchor' href='?id=10212-10241'>??????D</a>
<a is='spa-anchor' href='?id=11351-11361'>???????????????</a>
<a is='spa-anchor' href='?id=11445-11468'>????????????</a>
<a is='spa-anchor' href='?id=10242-10261'>????????????2019</a>
<a is='spa-anchor' href='?id=11741-11746'>????????????2021</a>
/
<a is='spa-anchor' href='?id=12257-12298'>???????????????</a>
<a is='spa-anchor' href='?id=12299-12305'>???????????????</a>
<a is='spa-anchor' href='?id=12306-12324'>???????????????</a>
  `;
  // return root;
  app.appendChild(root);
};

const header = () => {
  const header = document.createElement('div');
  header.innerHTML = `
  <a is='spa-anchor' href='.'>[??????]</a>
  `;
  return header;
};

const footer = () => {
  const footer = document.createElement('div');
  footer.innerHTML = `
  <hr />
  <div><a href="https://github.com/rsvzuiun/rs-item-viewer">[CODE]</a> ${version}</div>
  <footer>
    ????????????????????????????????????????????????????????????????????????????????????????????????????????????<br />
    ?????????????????????????????????????????????????????????????????????????????????????????????????????????<br />
    Copyright (c) L&K Co., Ltd. All Rights Reserved. License to GameOn Co., Ltd.
  </footer>`;
  return footer;
};

/** @param {number} id */
const render = (id) => {
  const item = itemdata[id];
  const nxitem = (item.NxId && item.NxId !== item.Id)
                  ? itemdata[item.NxId] : undefined;

  return gen_tooltip(item, nxitem);
};

/** @param {Item} item, @param {Item} nxitem */
const gen_tooltip = (item, nxitem) => {
  const tooltip = document.createElement('div');
  tooltip.translate = false;
  if (item.Rank === 'NX') {
    tooltip.className = 'tooltip border-nx';
  } else {
    tooltip.className = 'tooltip border-normal';
  }

  {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    const image = document.createElement('div');
    if (item.Id >= 0) {
      const anchor = document.createElement('a', {is: 'spa-anchor'});
      row.appendChild(anchor);
      if ((new URL(window.location.href)).searchParams.get('kr')) {
        anchor.href = `?kr=1&id=${item.Id}`;
      } else {
        anchor.href = `?id=${item.Id}`;
      }
      anchor.appendChild(image);
    } else {
      row.appendChild(image);
    }
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
    row.translate = true;
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
  if (item.AtParam?.Max || item.OpPrt.length || item.OpBit.length){
    {
      const row = document.createElement('div');
      tooltip.appendChild(row);

      row.className = 'label';
      row.innerText = '<????????????>';
    }
    if (!not_equipment.includes(item.Type)) {
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerText = '- ' + item_type[item.Type];
    }
    if (item.Flags?.includes('<????????????>')) {
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag(
        '<c:CTPURPLE>- ????????????????????????<n>');
    }
    if (item.Flags?.includes('<??????????????????>')) {
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerHTML = replaceColorTag(
        '<c:CTPURPLE>- ??????????????????<n>');
    }
  }
  {
    const atmin = item.AtParam?.Min || 0;
    const atmax = item.AtParam?.Max || 0;
    const speed = item.AtParam?.Speed || 0;

    if (atmin !== 0 || atmax !== 0) {
      const row = document.createElement('div');
      tooltip.appendChild(row);

      let html = `- ????????? <span class='text-color-LTYELLOW'>${atmin}~${atmax}</span>`;
      if (speed) {
        html += ` (<span class='text-color-LTYELLOW'>${(speed/100).toFixed(2)}</span>???)`;
      }
      row.innerHTML = html;
      if (nxitem && !equals(item.AtParam, nxitem.AtParam)) {
        row.className = 'item-different-line';
      }
    }
  }
  {
    const range = item.AtParam?.Range || 0;
    if (range !== 0) {
      const html = `- ???????????? <span class='text-color-LTYELLOW'>${range}</span>`;
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerHTML = html;
      if (nxitem && item.AtParam.Range !== nxitem.AtParam.Range) {
        row.className = 'item-different-line';
      }
    }
  }
  if (item.OpPrt) {
    item.OpPrt.map((baseop, idx) => {
      if (baseop.Id === -1) return null;

      const row = document.createElement('div');

      const Value = opPrtValue(item, idx);
      let opText = replaceOpText(textdata.OptionProper[baseop.Id], ...Value);
      if (!opText) return null;
      if (opText === 'undefined') {
        opText = `&lt;unknown_base id=${baseop.Id} value=[${Value}]&gt;`;
      } else {
        opText = opText.replace(/\[([+-]?)e\](0*????)/g, (org, sign, post) => {
            return yellow(`${sign}${item.Extra}${post}`);
          })
      }
      row.innerHTML = '- ' + opText;
      if (nxitem && (
             item.OpPrt[idx]?.Id !== nxitem.OpPrt[idx]?.Id
          || !equals(Value, opPrtValue(nxitem, idx))
          )) {
        row.className = 'item-different-line';
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  if (item.OpBit.some(e => e.Id !== 0)) {  // TODO: ?????????????????????
    item.OpBit.map((option, idx) => {
      const row = document.createElement('div');

      let opText = '';
      if (option.Text) {
        opText = replaceOpText(option.Text, ...option.Value);
      } else if (option.Id === -1) {
        return null;
      } else {
        opText = replaceOpText(textdata.OptionBasic[option.Id], ...option.Value);
        if (!opText) return null;
        if (opText === 'undefined') {
          opText = `&lt;unknown_op id=${option.Id} value=${option.Value}&gt;`;
        }
      }

      row.innerHTML = '- ' + opText;
      if (nxitem && !equals(item.OpBit[idx], nxitem.OpBit[idx])) {
        row.className = 'item-different-line';
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  } else {
    console.log(item)
  }
  if (nxitem && item.OpBit.length < nxitem.OpBit.length) {
    for (let i=0; i<nxitem.OpBit.length-item.OpBit.length; i++){
        const row = document.createElement('div');
      row.className = 'text-color-GRAY item-different-line';
      row.innerText = '- ??????';
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
      label.innerText = engraved[setid] ? `<?????? - ${
        engraved[setid].name
      }[${
        engraved[setid][equipid].name
      }]>` : `<?????? - #${setid}>`;

      {
        const row = document.createElement('div');
        tooltip.appendChild(row);
        row.innerHTML = replaceColorTag(
          '<c:CTPURPLE>- ?????????????????????????????????<n> <c:LTYELLOW>0/1<n>');
      }
      {
        const row = document.createElement('div');
        tooltip.appendChild(row);
        row.innerText = '- ????????? 30';
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
    row.innerText = '<?????? ??????????????? ??????>';
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
      row.innerText = '- ??????';
      tooltip.appendChild(row);
    }
  }
  {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<??????>';
  }
  {
    const row = document.createElement('div');
    row.translate = true;
    tooltip.appendChild(row);

    row.innerHTML = '- ' + replaceTextData(item.Text);
  }
  if (item.Require && Object.keys(item.Require).length) {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<???????????????>';

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
  if (item.Job?.length){
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<??????/?????????????????????>';
 
    item.Job.map(job => {
      const row = document.createElement('div');
      row.innerHTML = '- ' + job_type[job];
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  if (item.Id >= 0) {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<??????????????????>';

    const Id = document.createElement('div');
    tooltip.appendChild(Id);
    Id.innerHTML = `- ID ${yellow(item.Id)}`;

    if (item.StackSize > 1) {
      const StackSize = document.createElement('div');
      tooltip.appendChild(StackSize);
      StackSize.innerHTML = `- ???????????? ${yellow(item.StackSize)}`;
    }

    if (item.Durability) {
      const Durability = document.createElement('div');
      tooltip.appendChild(Durability);
      Durability.innerHTML = `- ???????????? ${yellow(item.Durability)}???`;
    }

    if (item.DropLv) {
      const DropLv = document.createElement('div');
      tooltip.appendChild(DropLv);
      DropLv.innerHTML = `- ????????????????????? ${yellow(item.DropLv)}`;
    }

    if (item.DropFactor) {
      const DropFactor = document.createElement('div');
      tooltip.appendChild(DropFactor);
      DropFactor.innerHTML = `- ?????????????????? ${yellow(item.DropFactor)}`;
    }

    if (item.Price && item.PriceFactor) {
      const Price = document.createElement('div');
      tooltip.appendChild(Price);
      Price.innerHTML = `- ?????? ${
        yellow(Math.floor(item.Price*item.PriceFactor/100).toLocaleString())
      } Gold`;
    }

    if (item.Flags) {
      const Flags = document.createElement('div');
      tooltip.appendChild(Flags);
      Flags.innerHTML = `- Flags ${yellow(item.Flags)}`;
    }
  }

  if (nxitem && item.Rank !== 'NX') {
    const root = document.createElement('div');
    root.className = 'nx-pair';
    root.appendChild(tooltip);
    root.appendChild(gen_tooltip(nxitem, item));
    return root;
  } else {
    return tooltip;
  }
};

/** @param {object} a, @param {object} b */
const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** @param {string | number} text */
const yellow = (text) => `<span class='text-color-LTYELLOW'>${text}</span>`;

/** @param {string} text, @param {...string|number} args */
function replaceOpSpecial(text, ...args) {
  text = String(text)
  .replace('?????????????????? [+0]([1]?????? ??????)',
    `<c:LTYELLOW>${job_type[args[1]]}<n> ?????????????????? [+0]`)
  .replace('$func837[0]',
    `<c:LTYELLOW>${['?????????', '?????????', '?????????'][args[0]]}<n>`)
  .replace('$func837[1]', args[1]>0 ? '?????? ?????????[1]??? ??????' : '')
  .replace('$func837[2]', args[2]>0 ? '?????? ?????????[2]??? ??????' : '')
  .replace('$func838[0]', args[0]===14 ? '<c:LTYELLOW>??????<n>' : '[0]')
  .replace('$func843[1]',
    `<c:LTYELLOW>${['???', '1', '2', '3', '???'][args[1]]}<n>`)
  .replace('$func844[0]',
    `<c:LTYELLOW>${['???', '1', '2', '3', '???'][args[0]]}<n>`)
  .replace('$func853[1]',
    `<c:LTYELLOW>${['0', '1', '???', '3', '4'][args[1]]}<n>`)
  return text
}

/** @param {string} text, @param {...string|number} args */
function replaceOpText(text, ...args) {
  text = replaceOpSpecial(text, ...args)
  .replace(/\r\n/g, '<br />&nbsp;')
  .replace(/\[([+-]?)([0-7])\](0*????)/g, (org, sign, opid, post) => {
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
