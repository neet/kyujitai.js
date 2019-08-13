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
  glyphRegExps: { [key in keyof Glyph]: RegExp };
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
        glyphs: {
          shinjitai: glyph.shinjitai,
          kyujitai: glyph.kyujitai,
        },
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

    const shinjitaiRegExp = new RegExp(
      '(' + entries.map(entry => entry.glyphs.shinjitai).join('|') + ')',
      'g',
    );

    const kyujitaiRegExp = new RegExp(
      '(' + entries.map(entry => entry.glyphs.shinjitai).join('|') + ')',
      'g',
    );

    const compiledDataset: CompiledDataest = {
      entries,
      exclusions: dataset.exclusions,
      glyphRegExps: {
        shinjitai: shinjitaiRegExp,
        kyujitai: kyujitaiRegExp,
      },
    };

    return compiledDataset;
  };

  private transformGlyph = async (
    target: string,
    params: TransformGlyphParams,
  ) => {
    const { from: sourceGlyph, to: targetGlyph } = params;
    const { entries, glyphRegExps } = this.compiledDataset;
    let result = target;

    result = result.replace(glyphRegExps[sourceGlyph], char => {
      const match = entries.find(entry => entry.glyphs[sourceGlyph] === char);

      if (!match) {
        throw new Error(`Unexpected regexp match "${char}"`);
      }

      return match.glyphs[targetGlyph];
    });

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
