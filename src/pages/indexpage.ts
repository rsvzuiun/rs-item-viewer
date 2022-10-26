import { TextData } from "../types";
import * as C from "../const";

export const index = (app: HTMLElement, textdata: TextData) => {
  const root = document.createDocumentFragment();
  const form = document.createElement("form");
  root.appendChild(form);
  form.action = ".";
  form.method = "get";
  form.innerHTML = /* html */ `
<label for='q'>キーワード:</label>
  <input type='text' name='q' id='q' /><br />
  (<a target='_blank' href='https://userweb.mnet.ne.jp/nakama/'>正規表現</a>が使えます 例:
  <a is='spa-anchor' href='?q=%5Eフ.%2Bン%24'>^フ.+ン$</a>
  <a is='spa-anchor' href='?q=ゲージング%7C辛苦'>ゲージング|辛苦</a>
  )
  <br />
<label for='selecttype'>部位: </label>
  <input type='text' id='selecttype' name='selecttype' list='selecttype-list' />
  <datalist id='selecttype-list'></datalist>
  <br />
<label for='selectop'>オプション:</label>
  <input type='text' id='selectop' name='selectop' list='selectop-list' />
  <datalist id='selectop-list'></datalist>
  <br />
<label for='selectjob'>職業:</label>
  <input type='text' id='selectjob' name='selectjob' list='selectjob-list' />
  <datalist id='selectjob-list'></datalist>
  <br />
等級:
  <input type='radio' name='rank' id='rank-all' value='' checked='checked' /><label for='rank-all'>全て</label>
  <input type='radio' name='rank' id='rank-N' value='N' /><label for='rank-N'>N</label>
  <input type='radio' name='rank' id='rank-U' value='U' /><label for='rank-U'><img src='img/ui/type-icon-U.gif' /></label>
  <input type='radio' name='rank' id='rank-NX' value='NX' /><label for='rank-NX'><img src='img/ui/type-icon-NX.gif' /></label>
  <br />
<label for='grade'>等級:</label>
  <input type='radio' name='grade' id='grade-all' value='' checked='checked' /><label for='grade-all'>全て</label>
  <input type='radio' name='grade' id='grade-N' value='N' /><label for='grade-N'>N</label>
  <input type='radio' name='grade' id='grade-DX' value='DX' /><label for='grade-DX'><img src='img/ui/type-icon-DX.gif' /></label>
  <input type='radio' name='grade' id='grade-UM' value='UM' /><label for='grade-UM'><img src='img/ui/type-icon-UM.gif' /></label>
  <br />
<label for='group'>フィルタ:</label>
  <input type='radio' name='group' id='group-all' value='' checked='checked' /><label for='group-all'>全て</label>
  <input type='radio' name='group' id='group-w' value='w' /><label for='group-w'>武器</label>
  <input type='radio' name='group' id='group-nw' value='nw' /><label for='group-nw'>武器以外</label>
  <br />
<label>除外設定:</label>
  <input type='checkbox' id='A' name='A' value='1' /><label for='A'>[A]</label>
  <input type='checkbox' id='D' name='D' value='1' /><label for='D'>[D]</label>
  <input type='checkbox' id='E' name='E' value='1' /><label for='E'>[E]</label>
  <input type='checkbox' id='G' name='G' value='1' /><label for='G'>[G]</label>
  <input type='checkbox' id='R' name='R' value='1' /><label for='R'>[R]</label>
  <br />
<button type='submit'>検索</button> <button type='reset' onclick='storage.clear();'>クリア</button>
`;

  const selectoplist = form.querySelector("#selectop-list");
  if (selectoplist == null) throw new Error();
  for (const [k, v] of Object.entries(textdata.OptionBasic)) {
    const option = document.createElement("option");
    option.value = `${k}: ${v.replace(/<c:([^> ]+?)>(.+?)<n>/g, "$2")}`;
    selectoplist.appendChild(option);
  }
  form.appendChild(selectoplist);

  const selecttypelist = form.querySelector("#selecttype-list");
  if (selecttypelist == null) throw new Error();
  for (const [k, v] of Object.entries(C.item_type)) {
    if (C.not_equipment.includes(parseInt(k))) continue;
    const option = document.createElement("option");
    option.value = `${k}: ${v}`;
    selecttypelist.appendChild(option);
  }
  form.appendChild(selecttypelist);

  const selectjoblist = form.querySelector("#selectjob-list");
  if (selectjoblist == null) throw new Error();
  for (const [k, v] of Object.entries(C.job_type)) {
    if (k === "40" || k === "41") continue;
    const option = document.createElement("option");
    option.value = `${k}: ${v}`;
    selectjoblist.appendChild(option);
  }
  form.appendChild(selectjoblist);

  const link = document.createElement("div");
  root.appendChild(link);
  link.innerHTML = /* html */ `
<a is='spa-anchor' href='?lv=775&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=UM&rank=U&group=w'>775UMU武器</a>
<a is='spa-anchor' href='?lv=800&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=DX&rank=U&group=w'>800DXU武器</a>
<a is='spa-anchor' href='?lv=1000&grade=UM&rank=U&group=w'>1000UMU武器</a>
<a is='spa-anchor' href='?q=%5E%28%E3%83%96%E3%83%AC%E3%82%A4%E3%83%96%7C%E3%83%AD%E3%82%A6%E3%83%90%E3%82%B9%E3%83%88%7C%E3%82%A4%E3%83%B3%E3%83%86%E3%83%AA%29&group=w'>ブレイブ・インテリ・ロウバスト</a>
<a is='spa-anchor' href='?q=%5E%28%E3%82%AF%E3%83%AD%E3%82%A6%7C%E3%82%B7%E3%83%A3%E3%82%A4%E3%82%A8%E3%83%B3%29'>クロウ・シャイエン</a>
<a is='spa-anchor' href='?id=11846-11933,12107-12110'>1100DXU武器</a>
<a is='spa-anchor' href='?id=12502-12582'>1250UMU武器</a>
<br />
<a is='spa-anchor' href='?id=8285-8301'>BFU防具</a>
<a is='spa-anchor' href='?q=%5C%5B%E9%81%BA%E7%89%A9%5C%5D'>遺物</a>
<a is='spa-anchor' href='?lv=775&id=9122-&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=UM&rank=U&group=nw'>775UMU防具</a>
<a is='spa-anchor' href='?lv=800&q=%5E%28%3F%21.*%5C%5B%28R%7CE%29%5C%5D%29.*%24&grade=DX&rank=U&group=nw'>800DXU防具</a>
<a is='spa-anchor' href='?lv=1000&grade=UM&rank=U&group=nw'>1000UMU防具</a>
<a is='spa-anchor' href='?id=11934-11975'>1100DXU防具</a>
<a is='spa-anchor' href='?id=11976-12023,12155-12158'>1000UMU職鎧</a>
<a href='?kr=1&id=12818-12853'>[韓国]1250UMU防具</a>
`;

  const build = (groups: any) => {
    const frag = document.createDocumentFragment();
    for (let value of groups) {
      const child = document.createElement("div");
      frag.appendChild(child);
      if (typeof value[0] === "string") {
        const head = document.createElement("h2");
        head.innerText = value[0];
        child.className = "index-frame";
        child.appendChild(head);
        child.appendChild(build(value.slice(1)));
      } else {
        for (let i of value) {
          const image = document.createElement("div");
          image.className = "index-image";
          image.innerHTML = `<a is='spa-anchor' href='?type=${i}'><img src='img/type/${i}.png' /><br />${C.item_type[i]}</a>`;
          child.appendChild(image);
        }
      }
    }
    return frag;
  };
  root.appendChild(build(C.type_categories));
  const link_foot = document.createElement("div");
  root.appendChild(link_foot);
  link_foot.innerHTML = /* html */ `
<a is='spa-anchor' href='?id=4802-4815'>朱洛星</a>
<a is='spa-anchor' href='?lv=680&grade=DX&rank=U'>賭博師</a>
<a is='spa-anchor' href='?id=3626-3639,5651-5653,6403-6404,6939'>伝説</a>
<a is='spa-anchor' href='?q=インフィニティ.*%27'>IFULT</a>
/
<a is='spa-anchor' href='?id=10212-10241'>秘密D</a>
<a is='spa-anchor' href='?id=10362-10366'>混沌指</a>
<a is='spa-anchor' href='?id=11351-11361'>ヤティカヌ</a>
<a is='spa-anchor' href='?id=11445-11468'>閃の軌跡</a>
<a is='spa-anchor' href='?id=10242-10261'>デザコン2019</a>
<a is='spa-anchor' href='?id=11741-11746'>デザコン2021</a>
<a is='spa-anchor' href='?id=12344-12349'>デザコン2022</a>
/
<a is='spa-anchor' href='?id=12257-12298'>新協会武器</a>
<a is='spa-anchor' href='?id=12299-12305'>新協会補助</a>
<a is='spa-anchor' href='?id=12306-12324'>新協会防具</a>
`;
  app.appendChild(root);
};
