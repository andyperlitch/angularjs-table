'use strict';

var path = require('path');
var fs = require('fs');
var index = fs.readFileSync(path.normalize(__dirname + '/../app/index.html'), 'utf8');
var re = /src="bower_components[^"]+"/g;
var bower_scripts = index.match(re).map(function(src) {
  return src.replace('src="','app/').replace('"','');
});

module.exports = function() {
  return {
    basePath: '../',
    frameworks: ['mocha','sinon-chai', 'sinon', 'chai'],
    browsers: ['PhantomJS'],
    autoWatch: true,
    reporters: ['dots', 'coverage'],
    // plugins: ['karma-chrome-launcher','karma-mocha','karma-coverage'],

    // tell karma how you want the coverage results
    coverageReporter: {
      type : 'html',
      // where to store the report
      dir : 'coverage/'
    },

    // these are default values anyway
    singleRun: false,
    colors: true,
    
    files : bower_scripts.concat([

      //App-specific Code
      'src/**/*.js',
      'app/scripts/app.js',


      //Test-Specific Code
      'node_modules/chai/chai.js',
      'node_modules/sinon/pkg/sinon.js',
      'test/lib/chai-should.js',
      'test/lib/chai-expect.js'
    ])
  };
};
