// deno-lint-ignore-file no-explicit-any
interface Query {
  filter?: {
    [key: string]: any | {
      $eq?: any;
      $ne?: any;
      $gt?: any;
      $lt?: any;
      $gte?: any;
      $lte?: any;
      $regex?: RegExp;
    };
    $and?: Query["filter"][];
    $or?: Query["filter"][];
    $not?: Query["filter"];
  };
  select?: string[];
  sort?: { by: string; order: "asc" | "desc" };
  limit?: number;
}

type Data = { [key: string]: any }[];

export type { Data, Query };
