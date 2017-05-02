var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var riotify    = require('riotify');
var source = require('vinyl-source-stream');

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
});

gulp.task('default', ['js', 'sass']);

