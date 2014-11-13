var build = require('./build/build.js'),
    lint = require('./build/hint.js'),
    fs = require('fs');

var COPYRIGHT = fs.readFileSync('src/copyright.js', 'utf8');

desc('Check Raphael Layer source for errors with JSHint');
task('lint', function() {
    var files = build.getFiles();

    console.log('Checking for JS errors...');

    var errorsFound = lint.jshint(files);

    if(errorsFound > 0) {
        console.log(errorsFound + ' error(s) found.\n');
        fail();
    } else {
        console.log('\t No errors found.');
    }
});

desc('Combine and compress Raphael Layer source files');
task('build', ['lint'], function(compsBase32, buildName) {
    var pathPart = 'dist/rlayer' + (buildName ? '-' + buildName : ''),
        srcPath = pathPart + '.js',
        path = pathPart + '.min.js';

    var files = build.getFiles(compsBase32);

    console.log('Concatenating ' + files.length + ' files...');

    var content = build.combineFiles(files);

    var oldSrc = build.load(srcPath),
        newSrc = COPYRIGHT + content,
        srcDelta = build.getSizeDelta(newSrc, oldSrc);

    console.log('\tUncompressed size: ' + newSrc.length + ' bytes (' + srcDelta + ')');

    if(newSrc == oldSrc) {
        console.log('\tNo changes.');
    } else {
        build.save(srcPath, newSrc);
        console.log('\tSaved to ' + srcPath);
    }

    console.log('Compressing...');

    var oldCompressed = build.load(path),
        newCompressed = COPYRIGHT + build.uglify(content),
        delta = build.getSizeDelta(newCompressed, oldCompressed);

    console.log('\tCompressed size: ' + newCompressed.length + ' bytes (' + delta + ')');

    if(newCompressed === oldCompressed) {
        console.log('\tNo changes.');
    } else {
        build.save(path, newCompressed);
        console.log('\tSaved to ' + path);
    }
});

desc('Watch src directory and build on any changes');
watchTask(['build'], function () {
    this.watchFiles.include([
    './src/**/*.js'
    ]);
});

desc('Start http-server');
task("start", function () {
    var spawn = require('child_process').spawn;
    var child = spawn('npm', ['start']);
    child.stderr.on('data', function(stderr) {
    process.stderr.write(stderr);
    });
    child.stdout.on('data', function(stdout) {
        process.stdout.write(stdout);
    });
    child.on('exit', function(code) {
        if (code !== 0) {
        fail(code);
        } else {
        console.log('Done!');
        complete();
        }
    });
}, true);

task('default', ['build', 'start']);
