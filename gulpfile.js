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
      .pipe(gulp.dest('./public/style'));
});

// bundle with Webpack
gulp.task('js', function () {
   return webpackStream(webpackConfig, webpack)
      .pipe(gulp.dest('./public/script'));
});

gulp.task('default', ['js', 'sass']);

