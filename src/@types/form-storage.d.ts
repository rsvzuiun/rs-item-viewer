declare module "form-storage" {
  export default class FormStorage {
    constructor(selector: any, opt: any);
    save(): void;
    clear(): void;
    setCheckbox(): void;
    getState(): any;
    applyState(str: string): boolean;
    apply(): void;
  }
}
