var path = require('path');
var source = require('vinyl-source-stream');
var minimist = require('minimist');
var gulpif = require('gulp-if');
var gulp = require('gulp');
var gutil = require('gulp-util');
var preprocess = require('gulp-preprocess');
var watchify = require('watchify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var streamify = require('gulp-streamify');
var autoprefixer = require('gulp-autoprefixer');

// command line options
var minimistOptions = {
  string: ['env', 'mode'],
  default: { env: 'env.json', mode: 'dev' }
};
var options = minimist(process.argv.slice(2), minimistOptions);

var paths = {
  scripts: ['src/js/**/*.js'],
  styles: ['src/styl/reset.styl', 'src/styl/common.styl', 'src/styl/*.styl'],
};

function buildHtml(src, dest, context) {
  console.log(context);
  return gulp.src(path.join(src, 'index.html'))
    .pipe(preprocess({context: context}))
    .pipe(gulp.dest(dest));
}

function buildStyl(src, dest, mode) {
  return gulp.src(src)
    .pipe(stylus())
    .pipe(concat('app.css'))
    .pipe(autoprefixer())
    .pipe(gulpif(mode === 'prod', minifyCss()))
    .pipe(gulp.dest(dest + '/css/compiled/'));
}

function buildScripts(src, dest, mode) {
  var opts = (mode === 'prod') ? {} : { debug: true };
  var bundleStream = browserify(src + '/js/main.js', opts).bundle();

  return bundleStream
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
    .pipe(source('app.js'))
    .pipe(gulpif(mode === 'prod', streamify(uglify())))
    .pipe(gulp.dest(dest));
}

gulp.task('html', function() {
  return buildHtml('src', 'www', require('./' + options.env));
});

gulp.task('styl', function() {
  return buildStyl(paths.styles, 'www', options.mode);
});

gulp.task('scripts', function() {
  return buildScripts('./src', 'www', options.mode);
});

gulp.task('watch-scripts', function() {
  var opts = watchify.args;
  opts.debug = true;

  var bundleStream = watchify(browserify('./src/js/main.js', opts));

  function rebundle() {
    return bundleStream.bundle()
      .on('error', function(error) { gutil.log(gutil.colors.red(error.message)); })
      .pipe(source('app.js'))
      .pipe(gulp.dest('./www'));
  }

  bundleStream.on('update', rebundle);
  bundleStream.on('log', gutil.log);

  return rebundle();
});

// Watch Files For Changes
gulp.task('launch-watch', function() {
  gulp.watch(paths.styles, ['styl']);
  gulp.watch('src/index.html', ['html']);
});

gulp.task('default', ['html', 'styl', 'scripts']);
gulp.task('watch', ['html', 'styl', 'watch-scripts', 'launch-watch']);

module.exports = {
  buildHtml: buildHtml,
  buildStyl: buildStyl,
  buildScripts: buildScripts
};
