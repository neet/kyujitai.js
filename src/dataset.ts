/**
 * This module is expected to import by end-users not inside this repository
 * because those datasets are too large so it should be dynamically imported
 */
import glyphs from '../data/glyphs.json';
import doons from '../data/doons.json';
import { Dataset } from './types';

export const dataset: Dataset = {
  glyphs,
  doons,
  exclusions: [],
};
