const lineTemplate = (file) => `export * from '${file}.js';`;
const fileTemplate = (files) =>
    files.map((file) => lineTemplate(file)).join('\n') + '\n';

/**
 * BarrelGun configuration file
 * @see https://www.npmjs.com/package/barrelgun
 * @type {import("barrelgun").BarrelgunConfig["barrels"]} */
const barrels = [
    {
        path: ['src/*/index.ts', 'src/*/**/index.ts'],
        files: ['*.{controller,decorator,dto,guard,module,repository,service,middleware}.ts'],
        fileTemplate,
        lineTemplate,
    },
    {
        path: ['src/services/*/index.ts'],
        files: ['*.{client,error,module,service}.ts'],
        fileTemplate,
        lineTemplate,
    },
    {
        path: ['src/lib/**/index.ts'],
        files: ['*.ts', '*.{decorator,enum,model}.ts'],
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
