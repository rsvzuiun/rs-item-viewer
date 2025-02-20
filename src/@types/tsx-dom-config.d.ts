import "tsx-dom";

declare module "tsx-dom" {
  export interface TsxConfig {
    // Set one of these to false to disable support for them
    svg: false;
    // html: false;
  }
}

declare module "tsx-dom-types" {
  export interface HTMLAttributes {
    translate?: boolean;
  }
}
