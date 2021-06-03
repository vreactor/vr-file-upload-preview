import minimist from 'minimist';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import less from 'rollup-plugin-less';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

import { minifyCSS } from './.tools/css/minify-css';

const fs = require('fs');
const argv = minimist(process.argv.slice(2));

const config = {
    input: 'src/index.js',
    output: {
        name: 'index',
    },
    plugins: [
        copy({
            targets: [
                { src: 'README.md', dest: 'dist' },
                { src: 'CHANGELOG.md', dest: 'dist' },
                { src: 'package.json', dest: 'dist' },
            ],
        }),
        less({
            output: (styles, nodes) => {
                if (!fs.existsSync('./dist')){
                    fs.mkdirSync('./dist');
                }

                fs.writeFileSync(`./dist/vr-file-upload-preview.css`, styles);
                fs.writeFileSync(`./dist/vr-file-upload-preview.min.css`,
                    minifyCSS(styles)
                );


                return styles;
            },
        }),
        resolve({
            jsnext: true,
            main: true,
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true,
        }),
    ],
};

// Only minify browser (iife) version
if (argv.format === 'iife') {
    config.plugins.push(terser());
}

export default config;
