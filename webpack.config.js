import path from "path";

const __dirname = path.resolve();

export default {
    mode: process.env.WEBPACK_MODE,
    entry: "./src/index.ts",
    experiments: {
        outputModule: true,
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
        library: {
            type: "module",
        },
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
};
