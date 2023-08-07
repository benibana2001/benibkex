import { build } from 'vite';
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
        drop: ['console']
      },
      build: {
        minify: 'esbuild',
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
