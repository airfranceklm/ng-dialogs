var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var del         = require('del');
var browserSync = require('browser-sync').create();

gulp.task('package', ['clean', 'compile']);
gulp.task('compile', ['compile:js', 'compile:css']);
gulp.task('serve', ['compile', 'browser-sync']);

gulp.task('clean', function() {
    return del(['coverage', 'dist']);
});

gulp.task('compile:js', function() {
    gulp.src('./src/*.js')
        .pipe($.sourcemaps.init())
            .pipe($.rollup({
                entry: './src/ng-dialogs.js',
                format: 'umd'
            }))
            .pipe($.ngAnnotate())
            .pipe(gulp.dest('./dist'))
            .pipe($.uglify())
            .pipe($.rename({suffix: '.min'}))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compile:css', function() {
    gulp.src('./src/*.scss')
        // .pipe($.sourcemaps.init())
            .pipe($.sass({indentWidth: 4, outputStyle: 'expanded'}))
        // .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './demo',
            routes: {
                '/node_modules': 'node_modules',
                '/dist': 'dist'
            }
        }
    });

    gulp.watch('src/*.js', ['compile:js']);
    gulp.watch('src/*.scss', ['compile:css']);
    gulp.watch('dist/*.js').on('change', browserSync.reload);
    gulp.watch('demo/*.*').on('change', browserSync.reload);
});

