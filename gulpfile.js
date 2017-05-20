let gulp = require('gulp');
let sass = require('gulp-sass');
let browserify = require('browserify');
let riotify    = require('riotify');
let webpack = require('webpack-stream');
let source = require('vinyl-source-stream');

// Sass compile
gulp.task('sass', function () {
   gulp.src('./src/sass/*.scss')
      .pipe(sass({
         outputStyle: 'expanded'
      }))
      .pipe(gulp.dest('./style'));
});

gulp.task('js', function () {
   browserify(['./src/js/script'])
      .transform(riotify)
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./script'));

   gulp.src(['./src/js/script-newtask.js'])
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('./script'));
});

gulp.task('default', ['js', 'sass']);

