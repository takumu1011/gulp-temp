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
function compSass() {
    return gulp.src('src/assets/css/*.scss')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sassGlob())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(postcss([autoprefixer({
            browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
            cascade: false
        })]))
        .pipe(postcss([cssdeclsort({order: 'smacss'})]))
        .pipe(gulp.dest('src/assets/css'));
}
// serve
function serve(done) {
    browserSync.init({
        server: {
            baseDir: "src",
            index: "index.html"
        }
    });
    done();
}
//reload
function reload(done) {
    browserSync.reload();
    done();
}
// watch
function watch(done) {
    gulp.watch('src/assets/css/*.scss', gulp.series(compSass, reload));
    gulp.watch('src/assets/js/*.js', reload);
    gulp.watch('src/*.html', reload);
}
//release
function release(done) {
    gulp.src('src/index.html')
    .pipe(gulp.dest('dist/'));

    gulp.src([
        'src/assets/css/style.css',
        'src/assets/css/default.css'
    ])
    .pipe(gulp.dest('dist/assets/css/'));

    gulp.src('src/assets/js/script.js')
    .pipe(babel({
        presets: ['@babel/preset-env']
    }))
    .pipe(gulp.dest('dist/assets/js/'));

    gulp.src('src/assets/img/**')
    .pipe(gulp.dest('dist/assets/img'));
    done();
}

exports.sass = compSass;
exports.serve = serve;
exports.reload = reload;
exports.watch  = watch;
exports.default = gulp.parallel(watch , serve);
exports.release = release;
