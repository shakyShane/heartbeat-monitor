var gulp = require('gulp');
var mocha = require('gulp-mocha');
//var mocha = require('gulp-jshint');

gulp.task('default', function () {
    gulp.src('test/*.js')
        .pipe(mocha({reporter: 'nyan'}));
});