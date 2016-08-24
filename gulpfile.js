'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');

let typescript;
let tsProject;
let sourcemaps;
gulp.task('build:typescript', () => {
    if (!typescript) {
        typescript = require('gulp-typescript');
        tsProject = typescript.createProject('tsconfig-main.json', {sortOutput: true});
        sourcemaps = require('gulp-sourcemaps');
    }
    let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('build'));
});

var tsProjectTests;
gulp.task('build:typescript:tests', () => {
    if (!typescript) {
        typescript = require('gulp-typescript');
        sourcemaps = require('gulp-sourcemaps');
    }
    if (!tsProjectTests) {
        tsProjectTests = typescript.createProject('tsconfig-tests.json');
    }
    var tsResult = tsProjectTests.src()
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProjectTests));

    return tsResult.js
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('build'));
});

gulp.task('build:tests', ['build:typescript:tests']);

gulp.task('build:dev', ['build:typescript', 'build:tests']);

let del;
gulp.task('clean', () => {
    if (!del) {
        del = require('del');
    }
    return del(['build']);
});

gulp.task('watch:dev', () => {
    gulp.watch(['src/**/*.ts'], ['build:typescript']);
    gulp.watch(['build/**/**'], ['run']);
});

gulp.task('watch', () => {
    gulp.watch(['src/**/*.ts'], ['build:typescript']);
});

let mocha;
let fs;
let processEnv;
let dotenv;
let env;
gulp.task('test', () => {
    if (!mocha) {
        mocha = require('gulp-mocha');
    }
    if (!fs) {
        fs = require('fs');
    }
    if (!env) {
        processEnv = require('gulp-process-env');
        dotenv = require('dotenv');
        // TODO: Read in .env file to json
        let buffer;
        try {
            buffer = fs.readFileSync(`${__dirname}/.env`);
        } catch (e) {
            console.log(`No .env file found`);
        }
        const envFile = dotenv.parse(buffer);
        env = processEnv(envFile);
    }
    return gulp.src(['build/**/tests/*.test.js'], {read: false})
            .pipe(env)
            .pipe(mocha())
            .pipe(env.restore());
});

let Foreman;
gulp.task('run', () => {
    if (!Foreman) {
        Foreman = require('gulp-nf').Foreman;
    }
    Foreman({
        cwd: `${process.cwd()}/`,
        procFile: `${process.cwd()}/Procfile`,
        envFile: `${process.cwd()}/.env`
    });
});

gulp.task('set-dev', () => {
    process.env.DEVELOPMENT = true;
});

gulp.task('build', (callback) => {
    runSequence('clean', ['build:typescript'], callback);
});

gulp.task('dev', (callback) => {
    runSequence('set-dev', 'build:dev', 'run', 'watch:dev', callback);
});

gulp.task('default', ['build']);
