/*
 * module dependencies
 */
var glob = require('glob');

/*
 * api functions
 */

exports.async = function(pattern, options, cb) {
  // get arguments right
  if (typeof options === 'function') cb = options, options = {};
  if (!options) options = {};
  cb = cb || noop;

  // extract variables and execute the glob search
  var search = exports.extractVars(pattern);
  exports.extractValues(search, options, cb);
};

exports = module.exports = exports.async;

exports.sync = function(pattern, options) {
  var search = exports.extractVars(pattern);
  exports.extractValuesSync(search, options);
  return search;
};

exports.hasMagic = glob.hasMagic;

exports.extractVars = function(pattern) {
  var g = pattern;

  // named vars
  var matchVar = /:[\w]+/g;
  var patternVars = pattern.match(matchVar);
  if (!patternVars) patternVars = [];
  patternVars.forEach(function(v) {
    g = g.replace(v, '*');
  });

  // segments
  var globs = g.split('/');
  var patterns = pattern.split('/');
  var vars = [], unnamed = [], named = [], globstars = 0;
  var segments = globs.map(function(segment, i) {
    var pattern = patterns[i];
    var type = 'text';
    var name = undefined;
    var magic = false;
    var globstar = segment === '**';
    if (globstar) globstars++;

    if (segment && glob.hasMagic(segment)) {
      magic = true;
      if (pattern !== segment) {
        type = 'named';
        var name = pattern.match(matchVar)[0].replace(':', '');
        named.push(name);
      } else {
        type = 'unnamed';
        name = segment;
        unnamed.push(segment);
      }
    }

    // segment object
    var obj = {
      segment: pattern,
      compiled: segment,
      type: type,
      name: name,
      globstar: globstar,
      index: i
    };

    if (magic) vars.push(obj);

    return obj;
  });

  // search object
  return {
    pattern: pattern,
    glob: g,
    globstars: globstars,
    named: named,
    unnamed: unnamed,
    vars: vars,
    segments: segments
  }
};

exports.extractValues = function(search, options, cb) {
  // get arguments right
  if (typeof options === 'function') cb = options, options = {}
  if (!options) options = {}
  cb = cb || noop;

  glob(search.glob, options, function(err, paths) {
    if (err) return cb(err);
    search.paths = paths;
    _extractValues(search);
    cb(err, search);
  });
};

exports.extractValuesSync = function(search, options) {
  search.paths = glob.sync(search.glob, options);
  _extractValues(search);
  return search;
};

exports.insertValues = function(pattern, values) {
  if (!values) return pattern;
  var segments = pattern.split('/');
  var p = segments.map(function(segment, i) {
    if (typeof values[segment] !== 'undefined') return values[segment];
    return segment;
  });
  return p.join('/');
};

/*
 * helper functions
 */

function _extractValues(search) {
  var values = [];
  search.paths.forEach(function(file) {

    var map = new Array(search.segments.length), begin = 0, end = 0, finished = false;

    // get the values for each path
    var fileSegments = file.split('/');

    if (!search.globstars) {
      // easy without globstar
      var obj = {};
      search.segments.forEach(function(segment, i) {
        if (fileSegments.length <= i) return;
        if (segment.type === 'text') return;
        obj[segment.segment] = fileSegments[i];
      });
      values.push(obj);

    } else {
      // globstar is a bit trickier
      var hit = false;
      var obj = {};
      var i, j;
      var ss = search.segments;
      var fs = fileSegments;

      // forward
      for (i = 0; i < ss.length; i++) {
        var segment = ss[i];
        if (segment.globstar) hit = true;
        if (hit) {
          begin = i;
          break;
        }
        map[i] = i;
      }

      // backward (segment and file lenght can be different)
      hit = false;
      for (i = ss.length - 1, j = fs.length - 1; i >= 0 && j >= 0; i--, j--) {
        var segment = ss[i];
        if (segment.globstar) hit = true;
        if (hit) {
          end = j;
          break;
        }
        map[i] = j;
      }

      // thing in between -> globstar
      map[begin] = [begin, end];

      // FIXME handle multiple globstars
      if (search.globstars && search.globstars > 1) {
        console.error('sorry, multiple globstars segments are not yet supported');
      }

      // finish up -> write values
      ss.forEach(function(segment, i) {
        if (segment.type !== 'text') {
          var mapping = map[i];
          if (Array.isArray(mapping)) {
            var g = fs.slice(mapping[0], (mapping[1] + 1)).join('/');
            obj[segment.segment] = g;
          } else {
            obj[segment.segment] = fs[mapping];
          }
        }
      });
      values.push(obj);
    }

  });

  search.values = values;

  return search;
}

function noop() {
}

function remove(str, sub) {
  var tmp = str.replace(sub, '');
  return cleanup(tmp);
}

function cleanup(str) {
  return str.replace(/\/\//g, '/');
}
