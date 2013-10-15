module.exports = function(grunt) {
	'use strict';

	// Nodejs libs.
	var path = require('path');

	// External lib.
	var phantomjs = require('grunt-lib-phantomjs').init(grunt);

	// Get an asset file, local to the root of the project.
	var asset = path.join.bind(null, __dirname, '..');

	var options,
		status,
		pageSuccessCount = 0;

	// Allow an error message to retain its color when split across multiple lines.
	var formatMessage = function(str) {
		return String(str).split('\n').map(function(s) { return s.magenta; }).join('\n');
	};

	// If options.force then log an error, otherwise exit with a warning
	var warnUnlessForced = function (message) {
		if (options && options.force) {
			grunt.log.error(message);
		} else {
			grunt.warn(message);
		}
	};

	// ASPUnit hooks.
	phantomjs.on('aspunit.pageStart', function(details) {
		grunt.log.write(details.page + '..');
	});

	phantomjs.on('aspunit.pageSuccess', function(details) {
		pageSuccessCount++;

		if (!details.passed) {
			grunt.log.error();
			for (var i = 0; i < details.modules.length; i++) {
				for (var j = 0; j < details.modules[i].tests.length; j++) {
					var test = details.modules[i].tests[j];
					if (!test.passed) {
						warnUnlessForced(test.name + ': ' + test.description);
					}
				}
			}
		} else {
			grunt.log.ok();
		}
	});

	phantomjs.on('aspunit.pageFail', function(details) {
		warnUnlessForced(details.error + ': ' + details.description);
	});

	phantomjs.on('aspunit.pageFinish', function(details) {
		status = details.status;
	});

	phantomjs.on('aspunit.finish', function() {
		var isOk = ((pageSuccessCount === status.pageCount) && (status.passCount === status.testCount));
		var msg = pageSuccessCount + ' of ' + status.pageCount + ' pages tested, ' +
			status.passCount + ' tests passed, ' + (status.testCount - status.passCount) + ' tests failed.';

		phantomjs.halt();

		grunt.log.writeln();

		if (isOk) {
			grunt.log.ok(msg);
		} else {
			warnUnlessForced(msg);
		}
	});

	// Re-broadcast aspunit events on grunt.event.
	phantomjs.on('aspunit.*', function() {
		var args = [this.event].concat(grunt.util.toArray(arguments));
		grunt.event.emit.apply(grunt.event, args);
	});

	// Built-in error handlers.
	phantomjs.on('fail.load', function(url) {
		phantomjs.halt();
		grunt.verbose.write('...');
		grunt.event.emit('aspunit.fail.load', url);
		grunt.log.error('PhantomJS unable to load "' + url + '" URI.');
	});

	phantomjs.on('error.onError', function (msg, stackTrace) {
		grunt.event.emit('aspunit.error.onError', msg, stackTrace);
	});

	// Pass-through console.log statements.
	phantomjs.on('console', console.log.bind(console));

	grunt.registerMultiTask('aspunit', 'Run ASPUnit unit tests in a headless PhantomJS instance.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		options = this.options({
			// Default PhantomJS timeout.
			timeout: 5000,
			// ASPUnit-PhantomJS bridge file to be injected.
			inject: asset('phantomjs/bridge.js'),
			// Explicit non-file URLs to test.
			urls: [],
			force: false
		});

		var urls = options.urls.concat(this.filesSrc);

		var done = this.async();

		grunt.util.async.forEachSeries(urls, function(url, next) {
			var basename = path.basename(url);

			// Launch PhantomJS.
			grunt.event.emit('aspunit.spawn', url);

			phantomjs.spawn(url, {
				options: options, // Additional PhantomJS options.
				done: function(err) { // Do stuff when done.
					if (err) {
						done(); // If there was an error, abort the series.
					} else {
						next(); // Otherwise, process next url.
					}
				},
			});
		},
		// All tests have been run.
		function() {
			done();
		});
	});
};