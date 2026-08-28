if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("deserialize", () => {
    expect(deserialize("")).toStrictEqual(new Map([]));
    expect(deserialize("a=1")).toStrictEqual(new Map([["a", ["1"]]]));
    expect(deserialize("a=1&a=2&a=3")).toStrictEqual(new Map([["a", ["1", "2", "3"]]]));
  });
}

function deserialize(query: string): Map<string, string[]> {
  const params = new URLSearchParams(query);
  return new Map(Array.from(params.keys()).map((k) => [k, params.getAll(k)]));
}

const targetSelector = `input:not([type="file"]):not([type="password"]), select, textarea`;
type TargetElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type Option = {
  name: string;
  ignores: string[];
  includes: string[];
  checkbox: string | null;
};

class FormStorage {
  private _selector: string;
  private _option: Option;
  private _checkbox: HTMLInputElement | null = null;

  public constructor(
    selector: string,
    opt?: {
      name?: string;
      ignores?: string[];
      includes?: string[];
      checkbox?: string | null;
    },
  ) {
    this._selector = selector;
    this._option = {
      ...({
        name: "form",
        ignores: [],
        includes: [],
        checkbox: null,
      } satisfies Option),
      ...opt,
    };
    document.addEventListener("DOMContentLoaded", () => {
      if (this._option.checkbox) {
        this._checkbox = document.querySelector(this._option.checkbox);
        this._setCheckbox();
      }
    });
  }

  public save(): void {
    window.localStorage.setItem(this._option.name, this._getState());
  }

  public apply(): void {
    const str = window.localStorage.getItem(this._option.name);
    if (str) this._applyState(str);
  }

  public clear(): void {
    window.localStorage.removeItem(this._option.name);
  }

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    this._form().addEventListener(type, listener, options);
  }

  public addChildrenEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    this._targets().forEach((e) => e.addEventListener(type, listener, options));
  }

  private _form(): HTMLFormElement {
    return document.querySelector(this._selector)!;
  }

  private _targets(): TargetElement[] {
    const { ignores, includes } = this._option;
    return [
      ...document.querySelectorAll<TargetElement>(`${this._selector} ${targetSelector}`),
    ].filter(
      (e) =>
        ignores.every((x) => !e.matches(x)) &&
        (includes.length === 0 || includes.some((x) => e.matches(x))),
    );
  }

  private _serialize(): string {
    const formdata = new FormData(this._form());
    const targetNames = this._targets().map((e) => e.name);
    [...formdata.keys()].forEach((k) => {
      if (!targetNames.includes(k)) formdata.delete(k);
    });
    return new URLSearchParams([...formdata].map(([k, v]) => [k, JSON.stringify(v)])).toString();
  }

  private _setCheckbox(): void {
    this._form().addEventListener("submit", () => {
      if (this._checkbox?.checked) {
        this.save();
      } else {
        this.clear();
      }
    });
  }

  private _getState(): string {
    return this._serialize();
  }

  private _applyState(str: string): void {
    const _targets = this._targets();
    const obj = deserialize(str);

    obj.forEach((values, key) => {
      const targets = _targets.filter((e) => e.matches(`[name="${key}"]`));
      if (targets.length === 0) return;

      targets.forEach((t, i) => {
        if ("checked" in t && ["checkbox", "radio"].includes(t.type)) {
          values.forEach((v) => {
            if (t.value === v) t.checked = true;
          });
        } else {
          if (i < values.length) t.value = values[i];
        }
      });
    });
  }
}

export default FormStorage;
