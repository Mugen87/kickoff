import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: 'src/main.js',
		output: [
			{
				format: 'umd',
				name: 'KICKOFF',
				file: 'build/bundle.min.js'
			}
		],
		plugins: [ resolve(), terser() ]
	}
];
