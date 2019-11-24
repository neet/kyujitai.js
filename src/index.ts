import { Dataset, GlyphType } from './dataset';
import { DatasetCompiler, CompiledDataest } from './dataset-compiler';

/** Constructor params */
export interface KyujitaiConstructorParams {
  compiledDataset: CompiledDataest;
}

/** Params of Kyujita#init */
export interface InitParams {
  dataset: Dataset;
}

/** Params for Kyujitai.transformGlyph */
export interface TransformGlyphParams {
  from: GlyphType;
  to: GlyphType;
}

export class Kyujitai {
  /** Compiled dataset */
  readonly compiledDataset: CompiledDataest;

  /**
   * Public constructor
   * @param params Parameters
   * @return Kyujitai instance
   */
  static init = async (params: InitParams) => {
    const compiledDataset = await new DatasetCompiler(params.dataset).compile();
    return new Kyujitai({ compiledDataset });
  };

  /**
   * Private constructor
   * @param params Parameters
   */
  private constructor(params: KyujitaiConstructorParams) {
    this.compiledDataset = params.compiledDataset;
  }

  /**
   * Alter the glyph of a character to another glyph
   * @param target Target string
   * @param params Options
   * @return Transformed string
   */
  private transformGlyph = async (
    target: string,
    params: TransformGlyphParams,
  ) => {
    const { entriesDict, glyphRegExps, exclusions } = this.compiledDataset;
    const { from: fromGlyph, to: toGlyph } = params;

    const activeRegExp = glyphRegExps[fromGlyph];
    const activeEntries = entriesDict[fromGlyph];

    return target.replace(activeRegExp, char => {
      if (exclusions.includes(char)) return char;

      const match = activeEntries[char];
      if (!match) throw new Error(`Unexpected regexp match "${char}"`);

      return match.glyphs[toGlyph];
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
