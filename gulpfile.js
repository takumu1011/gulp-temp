var gulp = require('gulp');
var sass = require('gulp-sass'); //Sassコンパイル
var plumber = require('gulp-plumber'); //エラー時の強制終了を防止
var notify = require('gulp-notify'); //エラー発生時にデスクトップ通知する
var sassGlob = require('gulp-sass-glob'); //@importの記述を簡潔にする
var browserSync = require( 'browser-sync' ); //ブラウザ反映
var postcss = require('gulp-postcss'); //autoprefixerとセット
var autoprefixer = require('autoprefixer'); //ベンダープレフィックス付与
var cssdeclsort = require('css-declaration-sorter'); //cssソート
var babel = require('gulp-babel'); //babel

// sass
gulp.task('sass', function() {
    return gulp
    .src( 'src/assets/css/*.scss' )
    .pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) ) //error check
    .pipe( sassGlob() )
    .pipe( sass({
        outputStyle: 'expanded' //expanded, nested, campact, compressed
    }) )
    .pipe( postcss([ autoprefixer(
        {
            browsers: ["last 2 versions", "ie >= 11", "Android >= 4"], // ☆IEは11以上、Androidは4.4以上 その他は最新2バージョンで必要なベンダープレフィックスを付与する設定
            cascade: false 
        }
        )]))
    .pipe( postcss([ cssdeclsort({ order: 'smacss' }) ]) ) //sort(smacss順)
    .pipe(gulp.dest('src/assets/css'));
});

// browser-sync
gulp.task( 'browser-sync', function(done) {
    browserSync.init({
        server: {
            baseDir: "src",
            index: "index.html"
        }
    });
    done();
});

//bs-reload
gulp.task( 'bs-reload', function(done) {
    browserSync.reload();
    done();
});

// watch
gulp.task( 'watch', function(done) {
    gulp.watch( 'src/assets/css/*.scss', gulp.series('sass', 'bs-reload') ); 
    gulp.watch('src/assets/js/*.js', gulp.task('bs-reload')); 
    gulp.watch('src/*.html', gulp.task('bs-reload')); 
});

// default
gulp.task('default', gulp.parallel('browser-sync', 'watch'));

//release
gulp.task('release', function(done) {
    gulp.src([
        'src/index.html'
    ])
    .pipe(gulp.dest('dist/'));
    
    gulp.src([
        'src/assets/css/style.css',
        'src/assets/css/default.css'
    ])
    .pipe(gulp.dest('dist/assets/css/'));
    
    gulp.src([
        'src/assets/js/script.js'
    ])
    .pipe(babel({
        presets: ['@babel/preset-env']
    }))
    .pipe(gulp.dest('dist/assets/js/'));
    
    gulp.src([
        'src/assets/img/**'
    ])
    .pipe(gulp.dest('dist/assets/img/'));
    done();
});