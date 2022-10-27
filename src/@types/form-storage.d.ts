declare module "form-storage" {
  export default class FormStorage {
    constructor(selector: unknown, opt: unknown);
    save(): void;
    clear(): void;
    setCheckbox(): void;
    getState(): unknown;
    applyState(str: string): boolean;
    apply(): void;
  }
}
