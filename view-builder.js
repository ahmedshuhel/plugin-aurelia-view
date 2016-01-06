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


function createStubDefines(loads, compileOpts) {
  return loads.map(function(load) {
    return (compileOpts.systemGlobal || 'System') + ".register('" + load.name + "', [], false, function() {});";
  }).join('\n');
}

exports.bundle = function(loads, compileOpts, outputOpts) {
  var loader = this;

  return loader['import']('html-minifier')
    .then(function(minifier) {

      var stubDefines = createStubDefines(loads, compileOpts);

var strVar="";
strVar += "<template>";
strVar += "  <require from=\"nav-bar.html\"><\/require>";
strVar += "  <require from=\"bootstrap\/css\/bootstrap.css\"><\/require>";
strVar += "";
strVar += "  <nav-bar router.bind=\"router\"><\/nav-bar>";
strVar += "";
strVar += "  <div class=\"page-host\">";
strVar += "    <router-view><\/router-view>";
strVar += "  <\/div>";
strVar += "<\/template>";
strVar += "";

      /*
      loads.map(function(load){
           load.metadata.format = 'amd';
           load.source = 'def' + 'ine(function(){ return "' + escape(minifier.minify(load.source)) + '"; });
      });
     */

      return [stubDefines, '("' + escape(minifier.minify(strVar)) + '");'].join('\n');
    })
    .catch(function(err) {
      if (err.toString().indexOf('ENOENT') != -1) {
        throw new Error(
          'Install html-minifier via `jspm install npm:html-minifier --dev` for HTML/CSS build support. Set System.buildHTML = false to skip  builds.');
      }
      throw err;
    });
};
