import commonjs from "@rollup/plugin-commonjs";
import ts from "rollup-plugin-ts";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";

const isDev = !!process.env.ROLLUP_WATCH;

export default {
    input: "src/index.ts",
    output: [
        {
            dir: "dist/",
            format: "cjs",
            sourcemap: isDev,
        },
    ],
    external: ["qs", "validator/lib/isURL"],
    plugins: [
        del({ targets: "dist/*" }),

        commonjs(),

        ts({
            tsconfig: "tsconfig.json",
        }),

        !isDev &&
            terser({
                compress: {
                    drop_console: true,
                },
                sourceMap: true,
            }),
    ],
};
