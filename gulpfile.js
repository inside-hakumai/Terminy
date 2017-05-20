let gulp = require('gulp');
let sass = require('gulp-sass');
let webpackStream = require('webpack-stream');
let webpack = require('webpack');
let cleanCSS = require('gulp-clean-css');

let webpackConfig = require('./webpack.config.js');

// local sass file compile
gulp.task('sass', function () {
   gulp.src('./src/sass/*.scss')
      .pipe(sass({
         outputStyle: 'expanded'
      }))
      .pipe(cleanCSS())
      .pipe(gulp.dest('./style'));
});

// bundle with Webpack
gulp.task('js', function () {
   gulp.src(['./webpack.config.js', './src/js/script-newtask.js'])
      .pipe(webpackStream(webpackConfig, webpack))
      .pipe(gulp.dest('./script'));
});

gulp.task('default', ['js', 'sass']);

