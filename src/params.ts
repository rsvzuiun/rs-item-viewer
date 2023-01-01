type Params = {
  kr: boolean;
  sandbox: boolean;
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

  unknown: boolean;
};

export const isIndex = (): boolean =>
  new URL(window.location.href).searchParams.toString() === "";

export const isKr = (): boolean =>
  Boolean(new URL(window.location.href).searchParams.get("kr"));

export const getParams = (): Params => {
  const searchParams = new URL(window.location.href).searchParams;

  return {
    kr: Boolean(searchParams.get("kr")),
    sandbox: Boolean(searchParams.get("sandbox")),
    infty: Boolean(searchParams.get("oo")),

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

    A: Boolean(searchParams.get("A")),
    D: Boolean(searchParams.get("D")),
    E: Boolean(searchParams.get("E")),
    G: Boolean(searchParams.get("G")),
    R: Boolean(searchParams.get("R")),

    unknown: Boolean(searchParams.get("unknown")),
  };
};
