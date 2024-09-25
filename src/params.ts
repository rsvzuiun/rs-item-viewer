type Params = {
  weapon: boolean;
  protector: boolean;

  kr: boolean;
  infty: boolean;

  id: string | null;
  query: string | null;
  not_query: string | null;
  type: number;
  op: number;
  baseop: number;
  rank: string | null;
  grade: string | null;
  group: string | null;
  job: number;
  lv: string | null;
  keyword: string | null;

  A: boolean;
  D: boolean;
  E: boolean;
  G: boolean;
  R: boolean;

  nodiff: boolean;
  unknown: boolean;
};

export const isIndex = (): boolean =>
  new URL(window.location.href).searchParams.toString() === "";

export const isKr = (): boolean =>
  new URL(window.location.href).searchParams.get("kr") !== null;

export const getParams = (): Params => {
  const searchParams = new URL(window.location.href).searchParams;

  return {
    weapon: searchParams.get("weapon") !== null,
    protector: searchParams.get("protector") !== null,
    kr: searchParams.get("kr") !== null,
    infty: searchParams.get("oo") !== null,

    id: searchParams.get("id"),
    query: searchParams.get("q"),
    not_query: searchParams.get("nq"),
    type: Number(searchParams.get("type") || "NaN"),
    op: Number(searchParams.get("op") || "NaN"),
    baseop: Number(searchParams.get("baseop") || "NaN"),
    rank: searchParams.get("rank"),
    grade: searchParams.get("grade"),
    group: searchParams.get("group"),
    job: Number(searchParams.get("job") || "NaN"),
    lv: searchParams.get("lv"),
    keyword: searchParams.get("keyword"),

    A: searchParams.get("ADEGR") !== null || searchParams.get("A") !== null,
    D: searchParams.get("ADEGR") !== null || searchParams.get("D") !== null,
    E: searchParams.get("ADEGR") !== null || searchParams.get("E") !== null,
    G: searchParams.get("ADEGR") !== null || searchParams.get("G") !== null,
    R: searchParams.get("ADEGR") !== null || searchParams.get("R") !== null,

    nodiff: searchParams.get("nodiff") !== null,
    unknown: searchParams.get("unknown") !== null,
  };
};
