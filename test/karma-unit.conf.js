var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
  var conf = sharedConfig();

  conf.files = conf.files.concat([
    //extra testing code
    'app/bower_components/angular-mocks/angular-mocks.js',

    //mocha stuff
    // 'test/mocha.conf.js',

    //test files
    './test/spec/**/*.js'
  ]);

  // here we specify which of the files we want to appear in the coverage report
  conf.preprocessors = {
      'app/scripts/directives/ng-tabled.js': ['coverage']
  };

  config.set(conf);
};
