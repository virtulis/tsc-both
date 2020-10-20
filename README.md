## Produce both `.js` and `.mjs` files with `tsc`

A simple script to build both `.js` (CommonJS) and `.mjs` (ES6) modules
from the same TypeScript project and into a single directory.

If source maps are present they will be renamed and modified accordingly.

Run `npx tsc-both` in the directory with `tsconfig.json`. `outDir` must be set.

**WARNING:** `outDir` will be completely wiped before recompilation.

### `package.json` example

    {
        ...
        "scripts": {
            "build": "npx tsc-both",
            "prepare": "npm run build"
        },
        "devDependencies": {
            "tsc-both": "0.1.x"
        }
        ...
    }
