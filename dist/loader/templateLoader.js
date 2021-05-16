const { compileTemplate } = require("@vue/component-compiler-utils");

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
// isScoped 跟style <scoped> 关联的
module.exports = function(source, hashId, isScoped, functional) {
  // '\n<div id="app">\n  app\n  <Header />\n</div>\n'
  const loaderContext = this;

  // id:'7ba5bd90'// hash
  // type:'template'
  // vue:''

  // although this is not the main vue-loader, we can get access to the same
  // vue-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  // {}
  const options = {};
  const id = hashId;
  const isServer = loaderContext.target === "node";
  const isProduction =
    options.productionMode ||
    loaderContext.minimize ||
    process.env.NODE_ENV === "production";
  const isFunctional = functional;
  const scopeId = isScoped ? `data-v-${id}` : null;
  // allow using custom compiler via options
  const compiler = options.compiler || require("vue-template-compiler");

  const compilerOptions = Object.assign(
    {
      outputSourceRange: true,
    },
    options.compilerOptions,
    {
      scopeId,
      // scopeId: isScoped ? `data-v-${id}` : null,
      // comments: query.comments,
    }
  );

  // for vue-component-compiler
  const finalOptions = {
    source,
    filename: this.resourcePath,
    compiler,
    compilerOptions,
    // allow customizing behavior of vue-template-es2015-compiler
    transpileOptions: options.transpileOptions,
    transformAssetUrls: options.transformAssetUrls || true,
    isProduction,
    isFunctional,
    optimizeSSR: isServer && options.optimizeSSR !== false,
    prettify: options.prettify,
  };

  const compiled = compileTemplate(finalOptions);

  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach((tip) => {
      loaderContext.emitWarning(typeof tip === "object" ? tip.msg : tip);
    });
  }

  // errors
  if (compiled.errors && compiled.errors.length) {
    // 2.6 compiler outputs errors as objects with range
    if (
      compiler.generateCodeFrame &&
      finalOptions.compilerOptions.outputSourceRange
    ) {
      // TODO account for line offset in case template isn't placed at top
      // of the file
      loaderContext.emitError(
        `\n\n  Errors compiling template:\n\n` +
          compiled.errors
            .map(({ msg, start, end }) => {
              const frame = compiler.generateCodeFrame(source, start, end);
              return `  ${msg}\n\n${pad(frame)}`;
            })
            .join(`\n\n`) +
          "\n"
      );
    } else {
      loaderContext.emitError(
        `\n  Error compiling template:\n${pad(compiled.source)}\n` +
          compiled.errors.map((e) => `  - ${e}`).join("\n") +
          "\n"
      );
    }
  }

  const { code } = compiled;

  // finish with ESM exports
  // let finalRes = code + `\nexport { render, staticRenderFns }`;
  // make it iife  (code)()
  // let finalRes = `(` + code + `return{render,staticRenderFns}' +')()' ;
  const scopedCode = isScoped ? `_scopeId:'${scopeId}',` : "";
  // needsHotReload
  // fileHotReloadName
  let finalRes = `(function () {${code}return{${scopedCode}render,staticRenderFns}})()`;

  return finalRes;
};

function pad(source) {
  return source
    .split(/\r?\n/)
    .map((line) => `  ${line}`)
    .join("\n");
}
