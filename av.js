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

function getBuilder(loader) {
  return loader['import']('./css-builder' + (System.version ? '.js' : ''), {
    name: module.id
  });
}

exports.cssPlugin = true;

exports.fetch = function(load) {
  // individually mark loads as not built for buildCSS false
  if (this.buildCSS === false)
    load.metadata.build = false;
  // setting format = 'defined' means we're managing our own output
  load.metadata.format = 'defined';
  // don't load the CSS at all until build time
  return '';
};

exports.instantiate = function() {};

exports.bundle = function(loads, opts) {
  var loader = this;
  if (loader.buildCSS === false)
    return '';
  return getBuilder(loader).then(function(builder) {
    return builder.bundle.call(loader, loads, opts);
  });
};

exports.listAssets = function(loads, compileOpts, outputOpts) {
  var loader = this;

  return getBuilder(loader).then(function(builder) {
    return builder.listAssets.call(loader, loads, compileOpts, outputOpts);
  });
};

exports.translate = function() {
  load.metadata.format = 'amd';
  return 'def' + 'ine(function() {\nreturn "' + escape(load.source) + '";\n});';
}
