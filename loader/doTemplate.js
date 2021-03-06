const path = require("path");
const loaderUtils = require("loader-utils"); // webpack utils
const templateLoader = require("./templateLoader");
// 1.only one JOB :
// replace the template code to iife which return{render,staticRenderfns}
module.exports = function(source) {
  // check if this file is vue-highway jsfile
  // if not return sourced
  // TODO better condition?
  if (
    !/vue-highway/gi.test(source) || // j/ts which import vue-highway
    /loadVueHighway/gi.test(source) // [entry].js which import loadVueHighway
  )
    return source;

  // common vars start
  const loaderOptions = loaderUtils.getOptions(this) || {};
  const loaderContext = this;
  const { target, minimize, rootContext, resourcePath } = loaderContext;
  const options = loaderUtils.getOptions(loaderContext) || {};
  const isServer = target === "node";
  const isProduction =
    options.productionMode || minimize || process.env.NODE_ENV === "production";
  const filename = path.basename(resourcePath);
  const needsHotReload =
    !isServer && !isProduction && loaderOptions.hotReload !== false;
  // common vars end

  function doTemplate(sourceCode) {
    return sourceCode.replace(/\.template(.|\r?\n)*?\.done/g, (templateStr) => {
      // for god's sake that line could be comment !
      if(/\/\//g.test(templateStr)) return templateStr
      let compileTemplateRes = "";
      templateStr.replace(/<(.|\r?\n)*\>/g, (htmlStr) => {
        compileTemplateRes = templateLoader(
          htmlStr.trim(),
          "",
          false,
          /functional/g.test(htmlStr)
        );
      });
      return `.template(${compileTemplateRes}).done`;
    });
  }
  let afterDoTemplateCode = doTemplate(source);
  // TODO hotreload
  const code = afterDoTemplateCode;
  return code;
};
