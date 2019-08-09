export interface Glyph {
  shinjitai: string;
  kyujitai: string;
}

export interface Doons {
  kyujitai: string[];
  shinjitai: string[];
  affectedWords: string[];
}

export type Exclusion = string;

export interface Dataset {
  glyphs: Glyph[];
  doons: Doons[];
  exclusions: Exclusion[];
}
