var test = require('tape');
var equal = require('object-equal');
var glob = require('../index');

test('do search async', function(t) {
  glob(__dirname + '/fixtures/:module/public', function(err, search) {

    t.equal(search.globstars, 0);

    t.equal(search.paths.length, 2);

    t.equal(search.values.length, 2);
    t.equal(search.values[0][':module'], 'Irish-Pub');
    t.equal(search.values[1][':module'], 'test_pub');

    t.equal(search.vars.length, 1);
    search.vars[0].index = undefined;
    t.ok(equal(search.vars[0], {
        segment: ':module',
        compiled: '*',
        type: 'named',
        name: 'module',
        globstar: false,
        index: undefined
      })
    );

    t.end(err);
  })
});

test('do search sync', function(t) {
  var search = glob.sync('fixtures/:module/public');

  t.equal(search.globstars, 0);

  t.equal(search.paths.length, 2);

  t.equal(search.values.length, 2);
  t.equal(search.values[0][':module'], 'Irish-Pub');
  t.equal(search.values[1][':module'], 'test_pub');

  t.equal(search.vars.length, 1);
  search.vars[0].index = undefined;
  t.ok(equal(search.vars[0], {
      segment: ':module',
      compiled: '*',
      type: 'named',
      name: 'module',
      globstar: false,
      index: undefined
    })
  );

  t.end();

});

test('do search with globstar', function(t) {
  var search = glob.sync('fixtures/:module/public/:rest*');

  t.equal(search.globstars, 1);

  t.equal(search.paths.length, 14);

  t.equal(search.values.length, 14);
  t.equal(search.values[0][':module'], 'Irish-Pub');
  t.equal(search.values[0][':rest*'], '');

  t.equal(search.vars.length, 2);

  t.ok(equal(search.vars[0], {
      segment: ':module',
      compiled: '*',
      type: 'named',
      name: 'module',
      globstar: false,
      index: 1
    })
  );

  t.ok(equal(search.vars[1], {
      segment: ':rest*',
      compiled: '**',
      type: 'named',
      name: 'rest',
      globstar: true,
      index: 3
    })
  );

  t.end();

});

test('extractVars', function(t) {
  var search = glob.extractVars(':root/*/public');

  t.equal(search.globstars, 0);

  t.equal(search.vars.length, 2);

  t.ok(equal(search.vars[0], {
      segment: ':root',
      compiled: '*',
      type: 'named',
      name: 'root',
      globstar: false,
      index: 0
    })
  );

  t.end();

});

test('extractValuesSync', function(t) {
  var search = glob.extractVars(':root/*/public');
  glob.extractValuesSync(search);

  t.equal(search.globstars, 0);

  t.equal(search.paths.length, 2);

  t.equal(search.values.length, 2);
  t.equal(search.values[0][':root'], 'fixtures');
  t.equal(search.values[0]['*'], 'Irish-Pub');

  t.equal(search.vars.length, 2);
  t.ok(equal(search.vars[0], {
      segment: ':root',
      compiled: '*',
      type: 'named',
      name: 'root',
      globstar: false,
      index: 0
    })
  );

  t.ok(equal(search.vars[1], {
      segment: '*',
      compiled: '*',
      type: 'unnamed',
      name: '*',
      globstar: false,
      index: 1
    })
  );

  t.end();

});

test('insertValues', function(t) {

  var values = {':module': 'Irish-Pub', '**': 'css/bundle.css'};
  var result = glob.insertValues('fixtures/:module/public/**', values);

  t.equal(result, 'fixtures/Irish-Pub/public/css/bundle.css');

  t.end();

});

test('insertValues empty', function(t) {

  var values = {':module': 'Irish-Pub', '**': ''};
  var result = glob.insertValues('fixtures/:module/public/**', values);

  t.equal(result, 'fixtures/Irish-Pub/public/');

  t.end();

});
