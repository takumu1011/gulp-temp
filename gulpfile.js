const {src, dest, watch, series, parallel} = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const $ = loadPlugins();
const browserSync = require( 'browser-sync' ); 
const postcss = require('gulp-postcss'); 
const autoprefixer = require('autoprefixer'); 
const cssdeclsort = require('css-declaration-sorter'); 

//compSass
function compSass() {
    return src('src/assets/css/*.scss')
        .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}))
        .pipe($.sassGlob())
        .pipe($.sass({outputStyle: 'expanded'}))
        .pipe(postcss([autoprefixer({
            browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
            cascade: false
        })]))
        .pipe(postcss([cssdeclsort({order: 'smacss'})]))
        .pipe(dest('src/assets/css'));
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
// watching
function watching(done) {
    watch('src/assets/css/*.scss', series(compSass, reload));
    watch('src/assets/js/*.js', reload);
    watch('src/*.html', reload);
}
//release
function release(done) {
    src('src/index.html')
    .pipe(dest('dist/'));

    src([
        'src/assets/css/style.css',
        'src/assets/css/default.css'
    ])
    .pipe(dest('dist/assets/css/'));

    src('src/assets/js/script.js')
    .pipe($.babel({
        presets: ['@babel/preset-env']
    }))
    .pipe(dest('dist/assets/js/'));

    src('src/assets/img/**')
    .pipe($.imagemin())
    .pipe(dest('dist/assets/img'));
    done();
}

exports.sass = compSass;
exports.serve = serve;
exports.reload = reload;
exports.watching = watching;
exports.default = parallel(watching , serve);
exports.release = release;
