import { Dataset, Exclusion, Glyph } from './dataset';

export interface KyujitaiConstructorParams {
  compiledDataset: CompiledDataest;
}

export interface InitParams {
  dataset: Dataset;
}

export interface Entry {
  priority: number;
  glyphs: { [key in keyof Glyph]: string };
}

export interface CompiledDataest {
  entries: Entry[];
  exclusions: Exclusion[];
}

export interface TransformGlyphParams {
  from: keyof Glyph;
  to: keyof Glyph;
}

export class Kyujitai {
  readonly compiledDataset: CompiledDataest;

  private constructor(params: KyujitaiConstructorParams) {
    this.compiledDataset = params.compiledDataset;
  }

  static init = async (params: InitParams) => {
    const compiledDataset = await Kyujitai.compileDataset(params.dataset);
    return new Kyujitai({ compiledDataset });
  };

  private static compileDataset = async (dataset: Dataset) => {
    let entries: Entry[] = [];

    for (const glyph of dataset.glyphs) {
      entries.push({
        priority: 0,
        glyphs: glyph,
      });
    }

    for (const doon of dataset.doons) {
      for (const affectedWord of doon.affectedWords) {
        entries.push({
          priority: 1,
          glyphs: {
            kyujitai: doon.shinjitai.reduce(
              (prev, cur) => prev.replace(cur, doon.kyujitai[0]),
              affectedWord,
            ),

            shinjitai: doon.kyujitai.reduce(
              (prev, cur) => prev.replace(cur, doon.shinjitai[0]),
              affectedWord,
            ),
          },
        });
      }
    }

    entries = entries.sort((a, b) => b.priority - a.priority);

    const compiledDataset: CompiledDataest = {
      entries,
      exclusions: dataset.exclusions,
    };

    return compiledDataset;
  };

  private transformGlyph = async (
    target: string,
    params: TransformGlyphParams,
  ) => {
    const { from: sourceGlyph, to: targetGlyph } = params;
    let result = target;

    for (const entry of this.compiledDataset.entries) {
      result = result.replace(
        entry.glyphs[sourceGlyph],
        entry.glyphs[targetGlyph],
      );
    }

    return result;
  };

  kyujitaize = async (target: string) => {
    return await this.transformGlyph(target, {
      from: 'shinjitai',
      to: 'kyujitai',
    });
  };

  shinjitaize = async (target: string) => {
    return await this.transformGlyph(target, {
      from: 'kyujitai',
      to: 'shinjitai',
    });
  };
}
