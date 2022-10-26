export const genSPAAnchor = (callback: () => any) => {
  class SPAAnchor extends HTMLAnchorElement {
    constructor() {
      super();
      this.onclick = (e) => {
        e.preventDefault();
        window.history.pushState(null, "", this.href);
        callback();
      };
    }
  }
  return SPAAnchor;
};
