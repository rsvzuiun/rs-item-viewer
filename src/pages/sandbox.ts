export const sandbox = (app: HTMLElement) => {
  const root = document.createElement("div");
  root.innerHTML = /* html */ `
<textarea id='json' style='width: 80%; height: 30em'>{
  "Id": -1,
  "ImageId": 293,
  "NxId": 0,
  "Type": 35,
  "Name": "ゴールド",
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
  "Text": "お金",
  "Extra": 0
}</textarea>
<button onclick="o=document.getElementById('output');o.textContent='';try{o.appendChild(gen_tooltip(JSON.parse(document.getElementById('json').value)))}catch(e){o.textContent=e}">conv</button>
<div id='output'></div>
    `;
  app.appendChild(root);
};
