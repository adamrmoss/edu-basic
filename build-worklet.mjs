/**
 * Build script for GRIT AudioWorklet processor
 * 
 * Bundles the worklet processor as a standalone JS file that can be
 * loaded via audioContext.audioWorklet.addModule()
 */

import * as esbuild from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

const outDir = 'public';

// Ensure output directory exists
if (!existsSync(outDir))
{
    mkdirSync(outDir, { recursive: true });
}

const isWatch = process.argv.includes('--watch');

const buildOptions = {
    entryPoints: ['src/grit/worklet/grit-worklet-processor.ts'],
    bundle: true,
    outfile: `${outDir}/grit-worklet.js`,
    format: 'iife',
    target: 'es2022',
    platform: 'browser',
    sourcemap: process.argv.includes('--sourcemap'),
    minify: process.argv.includes('--minify'),
    logLevel: 'info',
};

if (isWatch)
{
    const context = await esbuild.context(buildOptions);
    await context.watch();
    console.log('Watching for changes...');
}
else
{
    await esbuild.build(buildOptions);
    console.log('Worklet build complete: public/grit-worklet.js');
}
