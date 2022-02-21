const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');

class MergeJsonGroupByFileNameWebpackPlugin {

    source = null;
    dist = null;

    constructor({source, dist}) {
        this.source = source;
        this.dist = dist
    }

    process(compiler, compilation) {
        const {sources: {RawSource}} = compiler.webpack;
        const files = fg.sync(this.source, {
            cwd: compiler.options.context,
            ignore: '**/*.!(json)',
            absolute: true,
        });

        const groups = files.reduce((carry, filePath) => {
            const fileName = path.basename(filePath).split('.').shift();
            let jsonStr = fs.readFileSync(filePath, {encoding: 'utf-8'});
            jsonStr = JSON.parse(jsonStr);
            carry[fileName] = {...(carry[fileName] ? carry[fileName] : {}), ...jsonStr}
            return carry;
        }, {})
        Object.keys(groups).forEach(key => {
            const outputPath = path.join(this.dist, `${key}.json`);
            const outputContent = JSON.stringify(groups[key]);
            compilation.emitAsset(outputPath, new RawSource(outputContent));
        });
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap(this.constructor.name, (compilation) => {
            const {Compilation} = compiler.webpack;
            compilation.hooks.processAssets.tap(
                {
                    name: this.constructor.name,
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
                },
                () => {
                    try {
                        this.process(compiler, compilation);
                    } catch (err) {
                        compilation.errors.push(err);
                    }
                },
            );
        });
    }
}

module.exports = MergeJsonGroupByFileNameWebpackPlugin
