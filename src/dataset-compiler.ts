import { Dataset, Exclusion, GlyphType } from './dataset';

/**
 * Entry is a superset of characters and doons that contains
 * the information of how to write in each glyph and priority of it
 */
export interface Entry {
  /** Priority. Higher one will be transformed earlier */
  priority: number;
  /** How to write in each glyph */
  glyphs: Record<GlyphType, string>;
}

/** Accessor for character -> entry */
export type EntryRecord = Record<string, Entry>;

/** Accessor for glyph -> character -> entry */
export type EntryRecordDict = Record<GlyphType, EntryRecord>;

/** Compiled dataset */
export interface CompiledDataest {
  entriesDict: EntryRecordDict;
  exclusions: Exclusion[];
  glyphRegExps: Record<GlyphType, RegExp>;
}

export class DatasetCompiler {
  private readonly dataset: Dataset;

  constructor(dataset: Dataset) {
    this.dataset = dataset;
  }

  async compile(): Promise<CompiledDataest> {
    let entries: Entry[] = [];
    entries.push(...this.compileGlyphs());
    entries.push(...this.compileDoons());
    entries = entries.sort((a, b) => b.priority - a.priority);

    return {
      exclusions: this.dataset.exclusions,
      entriesDict: {
        shinjitai: this.compileShinjitaiEntriesDict(entries),
        kyujitai: this.compileKyujitaiEntriesDict(entries),
      },
      glyphRegExps: {
        shinjitai: this.compileShinjitaiRegExp(entries),
        kyujitai: this.compileKyujitaiRegExp(entries),
      },
    };
  }

  private compileGlyphs() {
    return this.dataset.glyphs.map(glyph => ({
      priority: 0,
      glyphs: {
        shinjitai: glyph.shinjitai,
        kyujitai: glyph.kyujitai,
      },
    }));
  }

  private compileDoons() {
    const entries: Entry[] = [];

    for (const doon of this.dataset.doons) {
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

    return entries;
  }

  private compileShinjitaiRegExp(entries: Entry[]) {
    return new RegExp(
      '(' + entries.map(entry => entry.glyphs.shinjitai).join('|') + ')',
      'g',
    );
  }

  private compileKyujitaiRegExp(entries: Entry[]) {
    return new RegExp(
      '(' + entries.map(entry => entry.glyphs.kyujitai).join('|') + ')',
      'g',
    );
  }

  compileShinjitaiEntriesDict(entries: Entry[]) {
    return entries.reduce<EntryRecord>((prev, cur) => {
      prev[cur.glyphs.shinjitai] = cur;
      return prev;
    }, {});
  }

  compileKyujitaiEntriesDict(entries: Entry[]) {
    return entries.reduce<EntryRecord>((prev, cur) => {
      prev[cur.glyphs.kyujitai] = cur;
      return prev;
    }, {});
  }
}
