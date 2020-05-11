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

// scssのコンパイル
gulp.task('sass', function() {
return gulp
.src( 'src/assets/css/*.scss' )
.pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) )//エラーチェック
.pipe( sassGlob() )//importの読み込みを簡潔にする
.pipe( sass({
outputStyle: 'expanded' //expanded, nested, campact, compressedから選択
}) )
.pipe( postcss([ autoprefixer(
{
// ☆IEは11以上、Androidは4.4以上
// その他は最新2バージョンで必要なベンダープレフィックスを付与する設定
browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
cascade: false}
) ]) )
.pipe( postcss([ cssdeclsort({ order: 'smacss' }) ]) )//プロパティをソートし直す(smacss順)
.pipe(gulp.dest('src/assets/css'));//コンパイル後の出力先
});

// 保存時のリロード
gulp.task( 'browser-sync', function(done) {
browserSync.init({

//ローカル開発
server: {
baseDir: "src",
index: "index.html"
}
});
done();
});

gulp.task( 'bs-reload', function(done) {
browserSync.reload();
done();
});

// 監視
gulp.task( 'watch', function(done) {
gulp.watch( 'src/assets/css/*.scss', gulp.task('sass') ); //sassが更新されたらgulp sassを実行
gulp.watch('src/assets/css/*.scss', gulp.task('bs-reload')); //sassが更新されたらbs-reloadを実行
gulp.watch('src/assets/js/*js', gulp.task('babel')); //jsが更新されたらgulp babelを実行
gulp.watch('src/assets/js/*js', gulp.task('bs-reload')); //jsが更新されたらbs-reloadを実行
gulp.watch('src/*.html', gulp.task('bs-reload')); //htmlが更新されたらbs-reloadを実行
});

// default
gulp.task('default', gulp.series(gulp.parallel('browser-sync', 'watch')));

//納品ファイル
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