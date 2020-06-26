const { src, dest, watch, series, parallel } = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const $ = loadPlugins();
const browserSync = require('browser-sync');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter');

const paths = {
  dist: 'dist/',
  src: 'src/',
  css: 'src/assets/css/',
  js: 'src/assets/js/',
  img: 'src/assets/img/',
};

//sass
function sass() {
  return src(paths.css + '*.scss')
    .pipe(
      $.plumber({
        errorHandler: $.notify.onError('Error: <%= error.message %>'),
      })
    )
    .pipe($.sassGlob())
    .pipe($.sass({ outputStyle: 'expanded' }))
    .pipe(
      postcss([
        autoprefixer({
          browsers: ['last 2 versions', 'ie >= 11', 'Android >= 4'],
          cascade: false,
        }),
      ])
    )
    .pipe(postcss([cssdeclsort({ order: 'smacss' })]))
    .pipe(dest(paths.css));
}
//babel
function babel() {
  return src(paths.js + 'main.js')
    .pipe(
      $.babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe($.rename('script.js'))
    .pipe(dest(paths.js));
}
// server
function server(done) {
  browserSync.init({
    server: {
      baseDir: 'src',
      index: 'index.html',
    },
  });
  done();
}
//reload
function reload(done) {
  browserSync.reload();
  done();
}
// watching
function watching(done) {
  watch(paths.src + '*.html', reload);
  watch(paths.css + '*.scss', series(sass, reload));
  watch(paths.js + 'main.js', series(babel, reload));
}
//build
function release(done) {
  src(paths.src + '**/**').pipe(dest(paths.dist));

  src('src/assets/img/**').pipe($.imagemin()).pipe(dest('dist/assets/img/'));
  done();
}

exports.sass = sass;
exports.babel = babel;
exports.server = server;
exports.reload = reload;
exports.watching = watching;
exports.default = parallel(watching, server);
exports.build = build;
