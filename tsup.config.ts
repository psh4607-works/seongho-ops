import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    k: 'src/commands/k.ts',
  },
  outDir: 'plugins/seongho-ops/bin',
  format: 'esm',
  target: 'node22',
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
