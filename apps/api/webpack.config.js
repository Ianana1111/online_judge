const nodeExternals = require("webpack-node-externals");

/**
 * @oj/shared and @oj/db are ESM/NodeNext TypeScript *source* packages (their package.json
 * "exports" point straight at .ts files, no build step). Nest's default webpack build
 * externalizes everything in node_modules (via webpack-node-externals) and only runs
 * ts-loader over apps/api/src. That leaves two raw .ts files unresolvable by plain Node at
 * runtime (`node dist/main.js` can't `require()` a .ts file).
 *
 * Fix: bundle @oj/shared and @oj/db INTO dist/main.js (allowlist them out of the externals
 * check, and let our ts-loader rule transpile them like any other .ts source) while leaving
 * every other node_modules package (bullmq, ioredis, @prisma/client, argon2, aws-sdk, etc.)
 * external and loaded from node_modules normally at runtime, exactly like Nest's default.
 *
 * ts-loader runs in transpileOnly mode, so it strips types file-by-file without resolving
 * imports through TypeScript's own module resolution — cross-package NodeNext vs. commonjs
 * settings never come into conflict. The only resolution that matters is webpack's own, which
 * we configure below to also try ".ts" whenever a ".js" specifier is requested (mirroring
 * NodeNext's "import './foo.js' finds foo.ts" behavior) so @oj/shared's relative imports like
 * `./verdicts.js` resolve to `verdicts.ts` on disk.
 */
module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      extensions: [".ts", ".js", ".json"],
      extensionAlias: {
        ".js": [".js", ".ts"],
      },
    },
    module: {
      ...options.module,
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                compilerOptions: {
                  module: "commonjs",
                  moduleResolution: "node",
                },
              },
            },
          ],
        },
      ],
    },
    externals: [
      nodeExternals({
        allowlist: [/^@oj\//],
      }),
    ],
  };
};
