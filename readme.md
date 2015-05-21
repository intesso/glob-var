# glob-var

extends [glob](https://github.com/isaacs/node-glob) with named variables.

# why?
use it when you want to transform the `glob` filename Array.

# how does it work?

 - variables start with a colon (like e.g. express.js routes variables)
 - the variables are then replaced with a star: `*`
   e.g. `fixtures/:module/public` turns into -> `fixtures/*/public`
   or   `fixtures/:module/public/:rest*` turns into -> `fixtures/*/public/**`
 - therefore `globstar` works as well (but only one `globstar` is allowed in the pattern right now)
 - instead of the glob filename Array, `glob-var` returns a search object with:
   - paths: glob filename Array
   - values: Array with variable key:value pair objects

# install

```bash
npm install glob-var
```

# use
```js

var glob = require('glob-var');

// async
glob(__dirname + '/fixtures/:module/public', function(err, search) {
    
    // -> search output:
    search == { pattern: 'fixtures/:module/public',
      glob: 'fixtures/*/public',
      globstars: 0,
      named: [ 'module' ],
      unnamed: [],
      vars: 
       [ { segment: ':module',
           compiled: '*',
           type: 'named',
           name: 'module',
           globstar: false,
           index: undefined } ],
      segments: 
       [ { segment: 'fixtures',
           compiled: 'fixtures',
           type: 'text',
           name: undefined,
           globstar: false,
           index: 0 },
         { segment: ':module',
           compiled: '*',
           type: 'named',
           name: 'module',
           globstar: false,
           index: undefined },
         { segment: 'public',
           compiled: 'public',
           type: 'text',
           name: undefined,
           globstar: false,
           index: 2 } ],
      paths: [ 'fixtures/Irish-Pub/public', 'fixtures/test_pub/public' ],
      values: [ { ':module': 'Irish-Pub' }, { ':module': 'test_pub' } ] 
    }
});
```


```js
//or sync version
var search = glob.sync('fixtures/:module/public/:rest*');
search ==  { pattern: 'fixtures/:module/public/:rest*',
  glob: 'fixtures/*/public/**',
  globstars: 1,
  named: [ 'module', 'rest' ],
  unnamed: [],
  vars: 
   [ { segment: ':module',
       compiled: '*',
       type: 'named',
       name: 'module',
       globstar: false,
       index: undefined },
     { segment: ':rest*',
       compiled: '**',
       type: 'named',
       name: 'rest',
       globstar: true,
       index: 3 } ],
  segments: 
   [ { segment: 'fixtures',
       compiled: 'fixtures',
       type: 'text',
       name: undefined,
       globstar: false,
       index: 0 },
     { segment: ':module',
       compiled: '*',
       type: 'named',
       name: 'module',
       globstar: false,
       index: undefined },
     { segment: 'public',
       compiled: 'public',
       type: 'text',
       name: undefined,
       globstar: false,
       index: 2 },
     { segment: ':rest*',
       compiled: '**',
       type: 'named',
       name: 'rest',
       globstar: true,
       index: 3 } ],
  paths: 
   [ 'fixtures/Irish-Pub/public',
     'fixtures/Irish-Pub/public/css',
     'fixtures/Irish-Pub/public/css/bundle.css',
     'fixtures/Irish-Pub/public/css/style.css',
     'fixtures/Irish-Pub/public/js',
     'fixtures/Irish-Pub/public/js/bundle.ss',
     'fixtures/Irish-Pub/public/readme.md',
     'fixtures/test_pub/public',
     'fixtures/test_pub/public/css',
     'fixtures/test_pub/public/css/bundle.css',
     'fixtures/test_pub/public/css/style.css',
     'fixtures/test_pub/public/js',
     'fixtures/test_pub/public/js/bundle.ss',
     'fixtures/test_pub/public/readme.md' ],
  values: 
   [ { ':module': 'Irish-Pub', ':rest*': '' },
     { ':module': 'Irish-Pub', ':rest*': 'css' },
     { ':module': 'Irish-Pub', ':rest*': 'css/bundle.css' },
     { ':module': 'Irish-Pub', ':rest*': 'css/style.css' },
     { ':module': 'Irish-Pub', ':rest*': 'js' },
     { ':module': 'Irish-Pub', ':rest*': 'js/bundle.ss' },
     { ':module': 'Irish-Pub', ':rest*': 'readme.md' },
     { ':module': 'test_pub', ':rest*': '' },
     { ':module': 'test_pub', ':rest*': 'css' },
     { ':module': 'test_pub', ':rest*': 'css/bundle.css' },
     { ':module': 'test_pub', ':rest*': 'css/style.css' },
     { ':module': 'test_pub', ':rest*': 'js' },
     { ':module': 'test_pub', ':rest*': 'js/bundle.ss' },
     { ':module': 'test_pub', ':rest*': 'readme.md' } ] 
}

```

# functions

## glob(pattern [,options] ,callback)
async pendant of glob.

## sync(pattern [,options])
glob's sync pendant.

## hasMagic(pattern [,options])
glob's hasMagic function

## extractVars(pattern)
returns the search object with these fields (example):

```js
search =  { pattern: ':root/*/public',
  glob: '*/*/public',
  globstars: 0,
  named: [ 'root' ],
  unnamed: [ '*' ],
  vars: 
   [ { segment: ':root',
       compiled: '*',
       type: 'named',
       name: 'root',
       globstar: false,
       index: 0 },
     { segment: '*',
       compiled: '*',
       type: 'unnamed',
       name: '*',
       globstar: false,
       index: 1 } ],
  segments: 
   [ { segment: ':root',
       compiled: '*',
       type: 'named',
       name: 'root',
       globstar: false,
       index: 0 },
     { segment: '*',
       compiled: '*',
       type: 'unnamed',
       name: '*',
       globstar: false,
       index: 1 },
     { segment: 'public',
       compiled: 'public',
       type: 'text',
       name: undefined,
       globstar: false,
       index: 2 } ]
}
```
## extractValues(search [,options] ,callback)

it runs the glob function and analyses the resulting filenames Array.
it adds the `paths` and `values` arrays to the `search` objects.
you can use this function after `extractVars`.
`glob(pattern [,options] ,callback)` does this internally.

## extractValuesSync(search [,options] ,callback)

same as `extractValues` but sync :-)
`sync(pattern [,options])` does this.

## insertValues(pattern, values)

it inserts the `values` into the `pattern`.






# test
```bash
npm test
```

# license
MIT


