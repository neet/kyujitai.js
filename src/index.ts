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

export type EntriesDict = {
  [key in keyof Glyph]: {
    [key: string]: Entry;
  };
};

export interface CompiledDataest {
  entries: Entry[];
  entriesDict: EntriesDict;
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
      const entry = {
        priority: 0,
        glyphs: {
          shinjitai: glyph.shinjitai,
          kyujitai: glyph.kyujitai,
        },
      };
      entries.push(entry);
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

    const shinjitaiEntreisDict = entries.reduce<{ [key: string]: Entry }>(
      (prev, cur) => {
        prev[cur.glyphs.shinjitai] = cur;
        return prev;
      },
      {},
    );

    const kyujitaiEntriesDict = entries.reduce<{ [key: string]: Entry }>(
      (prev, cur) => {
        prev[cur.glyphs.kyujitai] = cur;
        return prev;
      },
      {},
    );

    const compiledDataset: CompiledDataest = {
      entries,
      exclusions: dataset.exclusions,
      entriesDict: {
        shinjitai: shinjitaiEntreisDict,
        kyujitai: kyujitaiEntriesDict,
      },
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
    const { entriesDict, glyphRegExps, exclusions } = this.compiledDataset;

    return target.replace(glyphRegExps[sourceGlyph], char => {
      const match = entriesDict[sourceGlyph][char];

      if (!match) {
        throw new Error(`Unexpected regexp match "${char}"`);
      }

      if (exclusions.includes(char)) {
        return char;
      }

      return match.glyphs[targetGlyph];
    });
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
