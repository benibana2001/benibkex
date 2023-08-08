import { build } from 'vite';
import { argv } from 'node:process';

// staging環境ではlog消去、minifyを行わない
const STAGING = argv[2] && argv[2] === 'staging';

const packages = [
  {
    service_worker: 'src/service_worker.ts'
  },
  {
    content: 'src/content.ts'
  },
  {
    options: 'src/options/options.ts'
  }
];

async function buildPackages() {
  for (const _package of packages) {
    await build({
      esbuild: {
        drop: STAGING ? [] : ['console']
      },
      build: {
        minify: STAGING ? false : 'esbuild',
        target: 'esnext',
        emptyOutDir: false,
        rollupOptions: {
          input: _package,
          output: {
            dir: 'dist',
            entryFileNames: `[name].js`,
            // chunkFileNames: `[name].js`,
            inlineDynamicImports: true
          }
        }
      }
    });
  }
}

buildPackages();
