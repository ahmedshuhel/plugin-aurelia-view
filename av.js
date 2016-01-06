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

if (typeof window === 'undefined') {

  function getBuilder(loader) {
    return loader['import']('./view-builder.js', {
      name: module.id
    });
  }

  exports.AureliaViewPlugin = true;

  /*
  exports.fetch = function(load) {
    
    // individually mark loads as not built for buildView false
    if (this.buildView === false){
      load.metadata.build = false;
    }
    
    // setting format = 'defined' means we're managing our own output
    load.metadata.format = 'defined';
    
    // don't load the CSS at all until build time
    return '';
  };
  */

  exports.instantiate = function() {};

  exports.bundle = function(loads, opts) {
    var loader = this;
    if (loader.buildView === false) {
      return '';
    }

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

} else {
  exports.translate = function(load) {
    load.metadata.format = 'amd';
    return 'def' + 'ine(function() {\nreturn "' + escape(load.source) + '";\n});';
  }
}
