/* global version, status_type, extra_status_type, job_type, item_type, not_equipment */

let itemdata = [];
let textdata = {};
document.addEventListener('DOMContentLoaded', async () => {
  const params = (new URL(window.location.href)).searchParams;
  if (params.toString() === '') return; // TODO: 入口

  const itemdata_url = 'data/itemData.json';
  const textdata_url = 'data/textData.json';

  itemdata = await (await fetch(itemdata_url)).json();
  textdata = await (await fetch(textdata_url)).json();

  const id = parseInt(params.get('id'));
  if (id >= 0 && itemdata.map(e => e.Id).includes(id)) {
    document.getElementById('app').appendChild(render(params.get('id')));
  }

  const type = params.get('type');
  if (type >= 0 && Object.keys(item_type).includes(type)) {
    const hit = itemdata.filter(e => e.Rank !== 'NX' && e.Type == type);
    const result = document.createElement('p');
    document.getElementById('app').appendChild(result);
    result.innerText = `${item_type[type]}: ${hit.length}件`;

    hit.slice(0, 1000).map(item => {
      document.getElementById('app').appendChild(render(item.Id))
    })
  }

  document.getElementById('version').innerText = version;
});

const render = (id) => {
  const item = itemdata[id];
  const nxitem = item.NxId ? itemdata[item.NxId] : undefined;

  const tooltip = document.createElement('div');
  if (item.Rank === 'NX') {
    tooltip.className = 'tooltip border-nx';
  } else {
    tooltip.className = 'tooltip border-normal';
  }

  if (item.ImageId >= 0) {
    const row = document.createElement('div');
    tooltip.appendChild(row);

    const image = document.createElement('div');
    row.appendChild(image);
    image.className = 'image';

    if (item.ImageId >= 0){
      image.insertAdjacentHTML('beforeend',
      `<img src="img/item/${item.ImageId}.png" />`);
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
  { // name
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
    // <基本情報>
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<基本情報>';
  }
  if (!not_equipment.includes(item.Type)){ // type
    const row = document.createElement('div');
    tooltip.appendChild(row);
    row.innerText = '- ' + item_type[item.Type];
  }
  { // 攻撃力
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
      // 
      row.innerHTML = html;
      if (nxitem && !equals(item.AtParam, nxitem.AtParam)) {
        row.className = 'item-different-line';
      }
    }
  }
  { // 射程距離
    const range = item.AtParam.Range || 0;
    if (range !== 0) {
      const html = `- 射程距離 <span class='text-color-LTYELLOW'>${range}</span>`
      const row = document.createElement('div');
      tooltip.appendChild(row);
      row.innerHTML = html;
      if (nxitem && item.AtParam.Range !== nxitem.AtParam.Range) {
        row.className = 'item-different-line';
      }
    }
  }
  { // baseop
    item.OpPrt.map((baseop, idx) => {
      if (baseop.Id === -1) return null;

      const row = document.createElement('div');

      const Value = baseop.ValueIndex.map(index => {
        const min = item.ValueTable[index][0];
        const max = item.ValueTable[index][1];
        if (min === max) return min;
        return `[${min}~${max}]`
      });
      let opText = applyValue(replaceTextData(
        textdata.OptionProper[baseop.Id]), ...Value);
      if (opText === 'undefined') {
        opText = `&lt;unknown_base id=${baseop.Id} value=[${Value}]&gt;`
      }
      row.innerHTML = '- ' + opText;
      if (nxitem && !equals(item.OpPrt[idx], nxitem.OpPrt[idx])) {
        row.className = 'item-different-line';
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  { // option
    item.OpBit.map((option, idx) => {
      if (option.Id === -1) return null;

      const row = document.createElement('div');

      let opText = applyValue(replaceTextData(
        textdata.OptionBasic[option.Id]), ...option.Value);
      if (opText === 'undefined') {
        opText = `&lt;unknown_base id=${option.Id} value=${option.Value}&gt;`
      }
      opText = opText.replace(/(.+?)(\(.+?)(\d+)(.+系列 職業\))/,
        (match, p1, p2, p3, ) => {
        return `<span class='text-color-LTYELLOW'>${job_type[p3]}</span> ${p1}`;
      });
      row.innerHTML = '- ' + opText;
      if (nxitem && !equals(item.OpBit[idx], nxitem.OpBit[idx])) {
        row.className = 'item-different-line';
      }
      return row;
    }).filter(v => v).map(elm => tooltip.appendChild(elm));
  }
  // TODO: padding (ONLY DIFF MODE)
  if (nxitem || item.Rank === 'NX') { // <錬成 オプション 情報>
    const row = document.createElement('div');
    tooltip.appendChild(row);

    row.className = 'label';
    row.innerText = '<錬成 オプション 情報>';
  }
  { // nxoption
    item.OpNxt.map(option => {
      if (option.Id === -1) return null;

      const row = document.createElement('div');

      let opText = applyValue(replaceTextData(
        textdata.OptionBasic[option.Id]), ...option.Value);
      if (opText === 'undefined') {
        opText = `&lt;unknown_base id=${option.Id} value=${option.Value}&gt;`
      }
      opText = opText.replace(/(.+?)(\(.+?)(\d+)(.+系列 職業\))/,
        (match, p1, p2, p3, ) => {
        return `<span class='text-color-LTYELLOW'>${job_type[p3]}</span> ${p1}`;
      });
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
  { // <説明>
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
  if (Object.keys(item.Require).length) { // <要求能力値>
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
  if (item.Job.length){ // <着用/使用可能な職業>
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

  if (item.NxId && item.Rank !== 'NX') {
    const root = document.createElement('div');
    root.className = 'nx-pair';
    root.appendChild(tooltip);
    root.appendChild(render(item.NxId));
    return root;
  } else {
    return tooltip;
  }
}


const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function applyValue(text) {
  const args = arguments;
  return text.replace(/%v(\d)/g, (org, matched) => {
    return args[parseInt(matched) + 1];
  }).replace(/[+-]([+-])/g, "$1");
}

const replaceTextData = (text) => {
  text = ("" + text)
    .replace(/\r\n/g, "<br />")
    .replace(/(%d)?%a/g, "<br />")
    .replace(/(\[[^\]]*?)(\d)(.*?\])/g, "$1%v$2$3")
    .replace(/\[(.*?)\]/g, "<span class='text-color-LTYELLOW'>$1</span>")
  return replaceColorTag(text);
}

const replaceColorTag = (text) => {
  return text.replace(/<c:([^> ]+?)>(.+?)<n>/g,
  (string, matched1, matched2) => {
    return `<span class='text-color-${matched1}'>${matched2}</span>`;
  });
}
