import { gen_tooltip } from "../main";

export const sandbox = (app: HTMLElement) => {
  const root = document.createElement("div");
  const textarea = document.createElement("textarea");
  root.appendChild(textarea);
  textarea.id = "json";
  textarea.style.width = "80%";
  textarea.style.height = "40em";
  textarea.textContent = `{
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
}`;
  const button = document.createElement("button");
  root.appendChild(button);
  button.textContent = "変換!";
  button.onclick = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const output = document.getElementById("output")!;
    output.textContent = "";
    try {
      output.appendChild(
        gen_tooltip(
          JSON.parse(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (document.getElementById("json")! as HTMLTextAreaElement).value
          ),
          undefined
        )
      );
    } catch (e) {
      output.textContent = e as string;
    }
  };

  // <button onclick="o=document.getElementById('output');o.textContent='';try{o.appendChild(gen_tooltip(JSON.parse(document.getElementById('json').value)))}catch(e){o.textContent=e}">conv</button>
  // <div id='output'></div>
  //     `;
  const output = document.createElement("div");
  root.appendChild(output);
  output.id = "output";
  app.appendChild(root);
};
