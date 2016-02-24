'use strict';

var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
  var conf = sharedConfig();

  conf.files = conf.files.concat([
    //extra testing code
    'app/bower_components/angular-mocks/angular-mocks.js',

    //mocha stuff
    // 'test/mocha.conf.js',

    //test files
    './test/spec/**/*.js',

    // template files
    'src/templates/*.tpl.html'
  ]);

  
  conf.preprocessors = {
    // which html templates to be converted to js
    'src/templates/*.tpl.html': ['ng-html2js'],
    // files we want to appear in the coverage report
    // 'src/**/*.js': ['coverage']
  };

  conf.ngHtml2JsPreprocessor = {
    // strip this from the file path
    stripPrefix: 'app/',

    // setting this option will create only a single module that contains templates
    // from all the files, so you can load them all with module('foo')
    moduleName: 'apMesa.templates'
  };


  config.set(conf);
};
