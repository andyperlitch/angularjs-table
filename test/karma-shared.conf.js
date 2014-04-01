module.exports = function() {
  return {
    basePath: '../',
    frameworks: ['mocha','sinon-chai'],
    reporters: ['dot', 'coverage'],
    browsers: ['Chrome'],
    autoWatch: true,
    // plugins: ['karma-chrome-launcher','karma-mocha','karma-coverage'],
    reporters: ['dots', 'coverage'],

    // tell karma how you want the coverage results
    coverageReporter: {
      type : 'html',
      // where to store the report
      dir : 'coverage/'
    },

    // these are default values anyway
    singleRun: false,
    colors: true,
    
    files : [
      //3rd Party Code
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',

      //App-specific Code
      'app/scripts/directives/ng-tabled.js',
      'app/scripts/app.js',


      //Test-Specific Code
      'node_modules/chai/chai.js',
      'node_modules/sinon/lib/sinon.js',
      'test/lib/chai-should.js',
      'test/lib/chai-expect.js'
    ]
  }
};
