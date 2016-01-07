// it's bad to do this in general, as code is now heavily environment specific
var fs = System._nodeRequire('fs');
var isWin = process.platform.match(/^win/);

function escape(source) {
  return source
    .replace(/(["\\])/g, '\\$1')
    .replace(/[\f]/g, "\\f")
    .replace(/[\b]/g, "\\b")
    .replace(/[\n]/g, "\\n")
    .replace(/[\t]/g, "\\t")
    .replace(/[\r]/g, "\\r")
    .replace(/[\u2028]/g, "\\u2028")
    .replace(/[\u2029]/g, "\\u2029");
}

function fromFileURL(address) {
  address = address.replace(/^file:(\/+)?/i, '');

  if (!isWin) {
    address = '/' + address;
  } else {
    address = address.replace(/\//g, '\\');
  }

  return address;
}

exports.listAssets = function(loads, compileOpts, outputOpts) {
  return loads.map(function(load) {
    return {
      url: load.address,
      source: null,
      sourceMap: null,
      type: 'html'
    };
  });
};

/*
function getCleanCSSOptions(cssOptimize, outputOpts, outFile, rootURL) {
  return {
    advanced: cssOptimize,
    agressiveMerging: cssOptimize,
    mediaMerging: cssOptimize,
    restructuring: cssOptimize,
    shorthandCompacting: cssOptimize,

    target: outFile,
    relativeTo: rootURL,
    sourceMap: !!outputOpts.sourceMaps,
    sourceMapInlineSources: outputOpts.sourceMapContents
  };
}
*/

var minifyOpts = {
  collapseWhitespace: true
};

exports.bundle = function(loads, compileOpts, outputOpts) {
  var loader = this;

  return loader['import']('html-minifier')
    .then(function(minifier) {
      var bundle = loads.map(function(load) {
        return "System.registerDynamic(['" + load.name + "'], true, function(require, exports, module) { " +
          "module.exports = '" + escape(minifier.minify(load.source, minifyOpts)) + "';" +
          " });"
      });

      return bundle.join('\n');
    })
    .catch(function(err) {
      if (err.toString().indexOf('ENOENT') != -1) {
        throw new Error(
          'Install html-minifier via `jspm install npm:html-minifier --dev` for HTML/CSS build support. Set System.buildHTML = false to skip  builds.');
      }
      throw err;
    });
};
