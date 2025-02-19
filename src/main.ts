import "./main.css";
import { version } from "./const";
import { state } from "./store";
import { genSPAAnchor } from "./SPAAnchor";
import { isIndex, getParams } from "./params";
import { index, weapon, protector, search } from "./pages";
import FormStorage from "form-storage";

const storage = new FormStorage("form", {
  name: "rs-item-viewer",
  ignores: ['[type="hidden"]'],
});

function submit_handler(this: HTMLFormElement, e: SubmitEvent) {
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

const update = async () => {
  const app = document.getElementById("app");
  if (app == null) throw new Error();
  app.textContent = "";
  app.appendChild(header());
  await router(app);
  // TODO: 描画中にページ遷移するとfooterが2回描画される
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
    return index(app);
  }
  const params = getParams();
  if (params.weapon) return weapon(app);
  if (params.protector) return protector(app);
  return await search(app);
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
  <div><a href="https://github.com/rsvzuiun/rs-item-viewer">[CODE]</a> ${version}</div>
  <footer>
    Copyright (c) L&K Co., Ltd. All Rights Reserved.
  </footer>`;
  return footer;
};

const onload = async () => {
  customElements.define(
    "spa-anchor",
    genSPAAnchor(async () => {
      state.abort_render = true;
      await new Promise((resolve) => setTimeout(resolve, 0));
      update();
    }),
    { extends: "a" }
  );
  window.addEventListener("popstate", async () => {
    state.abort_render = true;
    await new Promise((resolve) => setTimeout(resolve, 0));
    update();
  });
  update();
};
if (document.readyState !== "loading") {
  await onload();
} else {
  document.addEventListener("DOMContentLoaded", onload);
}
