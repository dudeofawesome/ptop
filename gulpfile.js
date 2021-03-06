'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');

let typescript;
let envTS;
let tsProject;
let sourcemaps;
gulp.task('build:typescript', () => {
  if (!typescript) {
    typescript = require('gulp-typescript');
    envTS = require('typescript');
    sourcemaps = require('gulp-sourcemaps');
  }
  if (!tsProject) {
    tsProject = typescript.createProject('tsconfig-main.json', {rootDir: 'src', typescript: envTS});
  }
  let tsResult = tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject());

  return tsResult.js
    .pipe(sourcemaps.write({includeContent: true, sourceRoot: 'src/', destPath: 'build'}))
    .pipe(gulp.dest('build'));
});

var tsProjectTests;
gulp.task('build:typescript:tests', () => {
  if (!typescript) {
    typescript = require('gulp-typescript');
    envTS = require('typescript');
    sourcemaps = require('gulp-sourcemaps');
  }
  if (!tsProjectTests) {
    tsProjectTests = typescript.createProject('tsconfig-tests.json', {rootDir: 'src', typescript: envTS});
  }
  var tsResult = tsProjectTests.src()
    .pipe(sourcemaps.init())
    .pipe(tsProjectTests());

  return tsResult.js
    .pipe(sourcemaps.write({includeContent: true, sourceRoot: 'src/', destPath: 'build'}))
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
      const envFile = dotenv.parse(buffer);
      env = processEnv(envFile);
    } catch (e) {
      console.log(`No .env file found`);
      env = undefined;
    }
  }
  const gulpPipeline = gulp.src(['build/**/tests/*.test.js'], {read: false});
  if (env) {
    gulpPipeline.pipe(env);
  }
  gulpPipeline.pipe(mocha());
  if (env) {
    gulpPipeline.pipe(env.restore());
  }

  return gulpPipeline;
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
