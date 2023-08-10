import { build } from 'vite';
import { argv } from 'node:process';
import react from '@vitejs/plugin-react';

// staging環境ではlog消去、minifyを行わない
const STAGING = argv[2] && argv[2] === 'staging';

const packages = [
  {
    service_worker: 'src/service_worker.ts'
  },
  {
    content: 'src/content.ts'
  },
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

async function buildReact() {
  await build({
    plugins: [react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],
    esbuild: {
      loader: 'tsx'
    },
    build: {
      emptyOutDir: false,
      rollupOptions: {
        input: {
          options: 'src/options/options.tsx'
        },
        output: {
          dir: 'dist',
          entryFileNames: `[name].js`
        }
      }
    }
  });
}

async function buildCSS() {
  await build({
    build: {
      // cssCodeSplit: true,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          option: 'src/options/options.scss'
        },
        output: {
          dir: 'dist',
          assetFileNames: `[name].css`
        }
      }
    }
  });
}

buildPackages();
buildReact();
buildCSS();
