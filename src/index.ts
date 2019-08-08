import { Dataset, Glyph } from './dataset';

export interface KyujitaiConstructorParams {
  dataset: Dataset;
}

interface TransformGlyphParams {
  from: keyof Glyph;
  to: keyof Glyph;
}

export class Kyujitai {
  readonly dataset: Dataset;

  constructor(params: KyujitaiConstructorParams) {
    this.dataset = params.dataset;
  }

  private transformGlyph = (target: string, params: TransformGlyphParams) => {
    const { from: sourceGlyph, to: targetGlyph } = params;
    let result = target;

    // Transform dōons (the same phonologic characters)
    for (const doon of this.dataset.doons) {
      for (const affectedWord of doon.affectedWords) {
        result = result.replace(affectedWord, doon[targetGlyph][0]);
      }
    }

    // Character-to-character replacement
    for (const glyph of this.dataset.glyphs) {
      result = result.replace(glyph[sourceGlyph], glyph[targetGlyph]);
    }

    return result;
  };

  kyujitaize = (target: string) => {
    return this.transformGlyph(target, { from: 'shinjitai', to: 'kyujitai' });
  };

  shinjitaize = (target: string) => {
    return this.transformGlyph(target, { from: 'kyujitai', to: 'shinjitai' });
  };
}
