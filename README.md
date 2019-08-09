# @neetshin/kyujitai.js

> 🙏The datasets and algorithms are largely borrowed from **[hakatashi/kyujitai.js](https://github.com/hakatashi/kyujitai.js)**

Utility collections for making Japanese text old-fashioned.

## installation

```
npm install @neetshin/kyujitai
```

## Usage

```js
import { Kyujitai } from '@neetshin/kyujitai.js';
import { dataset } from '@neetshin/kyujitai.js/dataset';

const kyujitai = await Kyujitai.init({ dataset });

kyujitai.kyujitaize(`
  台風は旧字体でこのように書きますが、台湾はこのように書きます。
`);
// --> 颱風は舊字體でこのように書きますが、臺灣はこのように書きます。
```

## License

MIT
