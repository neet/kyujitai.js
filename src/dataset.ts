/**
 * This module is expected to be imported by end-users not inside this repository
 * because those datasets are too large so it should be dynamically imported
 */
import glyphs from '../data/glyphs.json';
import doons from '../data/doons.json';

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

export const dataset: Dataset = {
  glyphs,
  doons,
  exclusions: [],
};
