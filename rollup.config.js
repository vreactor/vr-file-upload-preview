import less from 'rollup-plugin-less'
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'
import minimist from 'minimist'
import copy from 'rollup-plugin-copy'

const argv = minimist(process.argv.slice(2))

const config = {
    input: 'src/index.js',
    output: {
        name: 'index'
    },
    plugins: [
        less({
            output: 'dist/styles/index.min.css',
            options: {
                compress: true
            }
        }),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true
        }),
        copy({
            targets: [
              { src: 'README.md', dest: 'dist' },
              { src: 'CHANGELOG.md', dest: 'dist' },
            ]
        })
    ]
}

// Only minify browser (iife) version
if (argv.format === 'iife') {
    config.plugins.push(terser())
}

export default config
