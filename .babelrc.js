module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: ["node 8"],
        modules: "commonjs",
      },
    ],
    ["minify"],
  ],
  plugins: [
    "minify-constant-folding",
    "minify-dead-code-elimination",
    "minify-guarded-expressions",
    "minify-mangle-names",
    "minify-simplify",
    "transform-merge-sibling-variables",
  ],
};
