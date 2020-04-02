const { series, dest, src, parallel } = require('gulp')
const del = require('del')
const ts = require('gulp-typescript')

const tsProject = ts.createProject('tsconfig.json')

function clean() {
  return del(['build/*'], { dot: true })
}

function tsParse() {
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(dest('build'))
}

function copyImage() {
  return src('src/images/*').pipe(dest('build/images'))
}

exports.default = series(clean, parallel(tsParse, copyImage))
