import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { readFileSync } from 'fs';

// Read package.json manually
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase());

export default {
  external: Object.keys(pkg.dependencies || {}).concat(['svelte']),
  input: 'src/index.svelte',
  output: [
    { file: pkg.module, 'format': 'es' },
    { 
      file: pkg.main, 
      format: 'umd', 
      name,
      globals: { 
        svelte: 'svelte',
        'youtube-player': 'YoutubePlayer'
      } 
    }
  ],
  plugins: [
    svelte({
      compilerOptions: {
        dev: false
      }
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs()
  ]
};