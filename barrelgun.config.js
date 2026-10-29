const lineTemplate = (file) => `export * from '${file}.js';`;
const fileTemplate = (files) =>
    files.map((file) => lineTemplate(file)).join('\n') + '\n';

/**
 * BarrelGun configuration file
 * @see https://www.npmjs.com/package/barrelgun
 * @type {import("barrelgun").BarrelgunConfig["barrels"]} */
const barrels = [
    {
        path: 'src/*/index.ts',
        files: ['*.{controller,module,service,middleware}.ts'],
        fileTemplate,
        lineTemplate,
    },
    {
        path: ['src/services/*/index.ts'],
        files: ['*.*.ts'],
        fileTemplate,
        lineTemplate,
    },
    {
        path: ['src/lib/**/index.ts'],
        files: '*.{decorator,enum,model}.ts',
        fileTemplate,
        lineTemplate,
    },
    {
        path: ['src/lib/index.ts'],
        files: '*.ts',
        fileTemplate,
        lineTemplate,
    },
];

export default { barrels };
