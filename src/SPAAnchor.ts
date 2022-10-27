export const genSPAAnchor = (callback: () => unknown) => {
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
