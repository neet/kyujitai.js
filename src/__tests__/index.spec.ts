import { dataset } from '../dataset';
import { Kyujitai } from '..';

describe('Kyujitai', () => {
  let kyujitai: Kyujitai;

  beforeAll(async () => {
    kyujitai = await Kyujitai.init({ dataset });
  });

  it('transforms shinjitai character to kyujitai', async () => {
    const shinjitai = await kyujitai.kyujitaize('旧字体');
    expect(shinjitai).toBe('舊󠄀字體󠄀');
  });

  it('transforms kyujitai character to shinjitai', async () => {
    const shinjitai = await kyujitai.shinjitaize('舊󠄀字體󠄀');
    expect(shinjitai).toBe('旧字体');
  });

  it('transforms doon shinjitai character to kyujitai', async () => {
    const shinjitai = await kyujitai.kyujitaize('台風');
    expect(shinjitai).toBe('颱風');
  });

  it('transforms doon kyujitai character to shinjitai', async () => {
    const shinjitai = await kyujitai.shinjitaize('颱風');
    expect(shinjitai).toBe('台風');
  });
});
