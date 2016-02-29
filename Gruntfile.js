// Generated on 2014-03-29 using generator-angular 0.7.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      src: 'src',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js', '<%= yeoman.src %>/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma:unit']
      },
      styles: {
        files: ['<%= yeoman.src %>/ap-mesa.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      html2js: {
        files: ['<%= yeoman.src %>/**/*.tpl.html'],
        tasks: ['html2js:development']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    html2js: {
      options: {
        
      },
      development: {
        options: {
          base: '.',
          module: 'apMesa.templates'
        },
        src: ['<%= yeoman.src %>/**/*.tpl.html'],
        dest: '.tmp/scripts/templates.js'
      },
      dist: {
        options: {
          base: '.',
          module: 'apMesa.templates'
        },
        src: ['<%= yeoman.src %>/templates/*.tpl.html'],
        dest: '<%= yeoman.dist %>/templates.js'
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9001,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35730
      },
      livereload: {
        options: {
          base: [
            '.tmp',
            '<%= yeoman.app %>',
            '.'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      },
      webserver: {
        options: {
          port: 8888,
          keepalive: true
        }
      },
      devserver: {
        options: {
          port: 8888
        }
      },
      testserver: {
        options: {
          port: 9999
        }
      },
      coverage: {
        options: {
          base: 'coverage/',
          port: 5555,
          keepalive: true
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp',
      templates: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/templates.js',
            '<%= yeoman.dist %>/*.tpl.html'
          ]
        }]
      },
      folders: {
        files: [{
          src: [
            '<%= yeoman.dist %>/controllers',
            '<%= yeoman.dist %>/directives',
            '<%= yeoman.dist %>/filters',
            '<%= yeoman.dist %>/services',
            '<%= yeoman.dist %>/templates'
          ]
        }]
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        // browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/',
          src: 'ap-mesa.css',
          dest: '<%= yeoman.dist %>/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    'bower-install': {
      app: {
        html: '<%= yeoman.app %>/index.html',
        ignorePath: '<%= yeoman.app %>/'
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/',
          src: 'ap-mesa.js',
          dest: '<%= yeoman.dist %>/'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        expand: true,
        cwd: '<%= yeoman.src %>',
        dest: '<%= yeoman.dist %>/',
        src: '**/*'
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.src %>',
        dest: '.tmp/styles/',
        src: 'ap-mesa.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    // concurrent: {
    //   server: [
    //     'copy:styles'
    //   ],
    //   test: [
    //     'copy:styles'
    //   ],
    //   dist: [
    //     'copy:styles',
    //     'imagemin',
    //     'svgmin'
    //   ]
    // },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/ap-mesa.min.css': [
            '<%= yeoman.dist %>/ap-mesa.css'
          ]
        }
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/ap-mesa.min.js': [
            '<%= yeoman.dist %>/ap-mesa.js'
          ]
        }
      }
    },
    concat: {
      dist: {
        options: {
          banner: '\'use strict\';\n',
          process: function(src, filepath) {
            return '// Source: ' + filepath + '\n' +
              src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
          }
        },
        src: ['<%= yeoman.dist %>/**/*.js'],
        dest: '<%= yeoman.dist %>/ap-mesa.js'
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: false,
        singleRun: true
      },
      unit_auto: {
        configFile: './test/karma-unit.conf.js'
      },
      midway: {
        configFile: './test/karma-midway.conf.js',
        autoWatch: false,
        singleRun: true
      },
      midway_auto: {
        configFile: './test/karma-midway.conf.js'
      },
      e2e: {
        configFile: './test/karma-e2e.conf.js',
        autoWatch: false,
        singleRun: true
      },
      e2e_auto: {
        configFile: './test/karma-e2e.conf.js'
      }
    },

    injector: {
      options: {
        addRootSlash: false
      },
      local_dependencies: {
        files: {
          '<%= yeoman.app %>/index.html': ['<%= yeoman.src %>/**/*.js'],
        }
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      // clears out .tmp folder
      'clean:server',

      // Copies styles from <app>/styles into .tmp/styles
      'copy:styles',

      // Adds browser prefixes to CSS3 properties
      // 'autoprefixer', // not for dev

      // Convert templates to js
      'html2js:development',

      // Serves from .tmp and <app>
      'connect:livereload',

      // Watches for changes, runs tasks based on changes
      'watch'
    ]);
  });

  grunt.registerTask('test', ['connect:testserver','karma:unit'/*,'karma:midway', 'karma:e2e'*/]);
  grunt.registerTask('test:unit', ['karma:unit']);
  grunt.registerTask('test:midway', ['connect:testserver','karma:midway']);
  grunt.registerTask('test:e2e', ['connect:testserver', 'karma:e2e']);

  //keeping these around for legacy use
  grunt.registerTask('autotest', ['autotest:unit']);
  grunt.registerTask('autotest:unit', ['connect:testserver','karma:unit_auto']);
  grunt.registerTask('autotest:midway', ['connect:testserver','karma:midway_auto']);
  grunt.registerTask('autotest:e2e', ['connect:testserver','karma:e2e_auto']);

  grunt.registerTask('build', [
    // Clears out dist and .tmp folders
    'clean:dist',
    // copy css, js
    'copy:dist',
    // prefixer
    'autoprefixer:dist',
    // minify css
    'cssmin:dist',
    // html2js
    'html2js:dist',
    // concat files
    'concat:dist',
    // remove templates.js
    'clean:templates',
    // remove folders from src dir structure
    'clean:folders',
    // ngmin js
    'ngmin:dist',
    // minify
    'uglify:dist'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
