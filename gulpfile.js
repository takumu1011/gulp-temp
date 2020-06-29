const { src, dest, watch, series, parallel } = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const $ = loadPlugins();
const browserSync = require('browser-sync');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter');

const paths = {
  dist: {
    dist: 'dist/',
    css: 'dist/assets/css/',
    js: 'dist/assets/js/',
    img: 'dist/assets/img/',
  },
  src: {
    src: 'src/',
    css: 'src/assets/css/',
    js: 'src/assets/js/',
    img: 'src/assets/img/',
  },
};

//sass
function sass() {
  return src(paths.src.css + '*.scss')
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
          cascade: false,
        }),
      ])
    )
    .pipe(postcss([cssdeclsort({ order: 'smacss' })]))
    .pipe(dest(paths.src.css));
}
//typescript
function typescript() {
  return src(paths.src.js + '/*.ts')
    .pipe(
      $.typescript({
        noImplicitAny: false,
        outFile: 'script.min.js',
      })
    )
    .pipe($.uglify())
    .pipe(dest(paths.src.js));
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
  watch(paths.src.src + '*.html', reload);
  watch(paths.src.css + '*.scss', series(sass, reload));
  watch(paths.src.js + '*.ts', series(typescript, reload));
}
//build
function build(done) {
  src(paths.src.src + '*.html').pipe(dest(paths.dist.dist));
  src(paths.src.css + '*.css').pipe(dest(paths.dist.css));
  src(paths.src.js + '*.js').pipe(dest(paths.dist.js));
  src(paths.src.img + '**')
    .pipe($.imagemin())
    .pipe(dest(paths.dist.img));
  done();
}

exports.sass = sass;
exports.typescript = typescript;
exports.server = server;
exports.reload = reload;
exports.watching = watching;
exports.default = parallel(watching, server);
exports.build = build;
