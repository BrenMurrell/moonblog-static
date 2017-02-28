/**
 *
 *	NV GulpFile
 *
 *	@version	0.1.0
 *	@author		Bren Murrell    [bren.murrell@nvinteractive.com]
 *	            Glen Honeybone  [glen.honeybone@nvinteractive.com]
 *
 */


/** ------------------------------------------------------------
 *	AVAILABLE TASKS
    sass			: Compile SCSS to CSS and add autoprefixing and sourcemapping
    watch           : Runs the 'sass' task above with browser-sync
    serve           : Runs the 'watch' task above
    default         : Runs 'serve' task above
    imagemin        : Run image optimisation to save some valuable kb's
 */

/** ------------------------------------------------------------
 *  OPTIONS
 */
var gulp = require('gulp');
var gutil = require('gulp-util'); // Some extra gulp utils
var sass = require('gulp-sass'); // Compiles sass
var sourcemaps = require('gulp-sourcemaps'); // Generates sass sourcemaps
//var imagemin = require('gulp-imagemin'); // Optimises images
var autoprefixer = require('gulp-autoprefixer'); // Adds vendor prefixes to css rules
var browserSync = require('browser-sync').create(); // Reloads the browser on file changes

require('es6-promise').polyfill(); // Adds es6 promises support


/** ------------------------------------------------------------
 *  OPTIONS
 */

// Set up a directories object for easy reference
var dirs = {
    css: './css',
    scss: './css/scss/**', // Includes all sub directories
    images: './images'
};

// Sass Output Settings
var sassConfig = {
    errLogToConsole: false,
    outputStyle: 'compact'
};

// Autoprefixer config
var apConfig = {
    browsers: ['last 2 versions', '> 5%'],
    cascade: true
};

// BrowserSync Config
var bsConfig = {
    enabled: true,
    proxy: "localhost:8902"
};



/** ------------------------------------------------------------
 *  TASKS
 */

// Creating a default task, called by simply running 'gulp' from the command line
gulp.task('default', ['serve']);


// Task: sass
// Compile SCSS to CSS
gulp.task('sass', function() {

    has_error = ''; // Track errors duing compile

    return gulp.src(dirs.scss + '/*.scss') // Get all files ending with .scss in app/scss and children dirs
        .pipe(sourcemaps.init())
        .pipe(sass(sassConfig).on('error', function(err) { // Handle errors gracefully
            has_error = true; // We have an error
            //gutil.log(gutil.colors.red(err.message)); // Spit out the error
            this.emit('end'); // We can't continue so jump to the end
        }))
        .pipe(sourcemaps.write()) // Output sourcemaps to a separate file
        .pipe(gulp.dest(dirs.css)) // Output compiled css to the css folder
        .pipe(autoprefixer(apConfig)) // Add out autoprefixing
        .pipe(browserSync.stream()) //inject css into page
        .on('end', function() { // Handle the end event
            if (has_error === '') { // If we don't have an error, compiling was successful
                gutil.log(gutil.colors.green('## CSS compile suceeded')); // Woohoo!
            }
        });
});


// Task: watch
// Run the sass task when called, then watch for changes
gulp.task('watch', ['sass'], function() {

    gulp.watch(dirs.scss + '/*.{scss,sass}', ['sass']); // If any file changes, re-run the sass task

});


// Task: serve
// Run the watch task, then fire up the browser if
// we have BrowserSync enabled
gulp.task('serve', ['watch'], function() {

    if (bsConfig.enabled === true) {
        browserSync.init({
            proxy: bsConfig.proxy
        });

        browserSync.stream();

        gulp.watch("Views/*.cshtml", "*.html").on('change', browserSync.reload); // Reload the page when a view file changes
    }
});


// Task: imagemin
// Optimise image compression. Run this prior to deployment.
// May eventually end up being run automatically as part of a build script.
// gulp.task('imagemin', function() {
//     return gulp.src(dirs.images + '/*') // Get all images
//         .pipe(imagemin())
//         // .pipe(gulp.dest(dirs.images))	            // Output to dist
//         .on('end', function() { gutil.log(gutil.colors.green('## Images optimised')); });
// });
