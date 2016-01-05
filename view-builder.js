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

function createStubDefines(writeStubs, loads, compileOpts) {
  if (!writeStubs) {
    return [];
  }

  return loads.map(function(load) {
    return (compileOpts.systemGlobal || 'System') + ".register('" + load.name + "', [], false, function() {});";
  }).join('\n')
}

exports.bundle = function(loads, compileOpts, outputOpts) {
  var loader = this;

  return loader['import']('html-minifier')
    .then(function(minifier) {

      // SystemJS Builder 0.14 will write the stubs for use, we detect by the 3 argument over 2 argument bundle call
      var writeStubs = typeof outputOpts == 'undefined';
      outputOpts = outputOpts || compileOpts;

      var stubDefines = createStubDefines(writeStubs, loads, compileOpts);
      var rootURL = loader.rootURL || fromFileURL(loader.baseURL);
      var cssOptimize = outputOpts.minify && outputOpts.cssOptimize !== false;

      /*
      var outFile = loader.separateCSS ? outputOpts.outFile.replace(/\.js$/, '.css') : rootURL;
      var cleanCSS = new CleanCSS(getCleanCSSOptions(cssOptimize, outputOpts, outFile, rootURL)).minify(loads.map(function(load) {
        return fromFileURL(load.address);
      }));
      if (cleanCSS.errors.length){
        throw new Error('CSS Plugin:\n' + cleanCSS.errors.join('\n'));
      }
      var cssOutput = cleanCSS.styles;

     */

    var contents = loads.map(function(load){
       return fs.readFileSync(fromFileURL(load.address), 'utf8');
    });

      console.log(contents);

      return [stubDefines, '("' + escape(output) + '");'].join('\n');
    })
    .catch(function(err) {
      if (err.toString().indexOf('ENOENT') != -1) {
        throw new Error('Install html-minifier via `jspm install npm:html-minifier --dev` for HTML/CSS build support. Set System.buildHTML = false to skip  builds.');
      }
      throw err;
    });
};
