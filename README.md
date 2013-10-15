# grunt-aspunit

> Run ASPUnit unit tests in a headless PhantomJS instance.



## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-aspunit --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-aspunit');
```



## ASPUnit task
_Run this task with the `grunt aspunit` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

When installed by npm, this plugin will automatically download and install [PhantomJS][] locally via the [grunt-lib-phantomjs][] library.

[PhantomJS]: http://www.phantomjs.org/
[grunt-lib-phantomjs]: https://github.com/gruntjs/grunt-lib-phantomjs

Also note that running grunt with the `--debug` flag will output a lot of PhantomJS-specific debugging information. This can be very helpful in seeing what actual URIs are being requested and received by PhantomJS.

### Options

#### urls
Type: `Array`  
Default: `[]`

Absolute `http://` or `https://` urls to be passed to PhantomJS. Note that urls must be served by a web server, and since this task doesn't contain a web server, one will need to be configured separately. The [grunt-iisexpress plugin](https://github.com/rpeterclark/grunt-iisexpress/) provides an IIS web server.

#### force
Type: `boolean`  
Default: `false`

When true, the whole task will not fail when there are individual test failures. This can be set to true when you always want other tasks in the queue to be executed.

### Usage examples

In this example, `grunt aspunit` will test two files, served from the server running at `localhost:8000`.

```js
// Project configuration.
grunt.initConfig({
  aspunit: {
    all: {
      options: {
        urls: [
          'http://localhost:8000/test/foo.asp',
          'http://localhost:8000/test/bar.asp'
        ]
      }
    }
  }
});
```

#### Using the grunt-iisexpress plugin
It's important to note that grunt does not automatically start a `localhost` web server. That being said, the [grunt-iisexpress plugin](https://github.com/rpeterclark/grunt-iisexpress/) `iisexpress` task can be run before the `aspunit` task to serve files via an IIS web server.

In the following example, if a web server isn't running at `localhost:8000`, running `grunt aspunit` with the following configuration will fail because the `aspunit` task won't be able to load the specified URLs. However, running `grunt iisexpress aspunit` will first start an IIS web server at `localhost:8000` with its base path set to the Gruntfile's directory. Then, the `aspunit` task will be run, requesting the specified URLs.

```js
// Project configuration.
grunt.initConfig({
  aspunit: {
    all: {
      options: {
        urls: [
          'http://localhost:8000/test/foo.asp',
          'http://localhost:8000/test/bar.asp',
        ]
      }
    }
  },
  iisexpress: {
    server: {
      options: {
        port: 8000
      }
    }
  }
});

// This plugin provides the "iisexpress" task.
grunt.loadNpmTasks('grunt-iisexpress');

// A convenient task alias.
grunt.registerTask('test', ['iisexpress', 'aspunit']);
```

#### Events and reporting
ASPUnit callback methods and arguments are also emitted through grunt's event system so that you may build custom reporting tools. Please refer to to the ASPUnit documentation for more information.

The events, with arguments, are as follows:

* `aspunit.start`
* `aspunit.pageStart` `(details)`
* `aspunit.pageSuccess` `(details)`
* `aspunit.pageFail` `(details)`
* `aspunit.pageFinish` `(details)`
* `aspunit.finish`

In addition to ASPUnit callback-named events, the following events are emitted by Grunt:

* `aspunit.spawn` `(url)`: when [PhantomJS][] is spawned for a test
* `aspunit.fail.load` `(url)`: when [PhantomJS][] could not open the given url
* `aspunit.fail.timeout`: when an ASPUnit test times out, usually due to a missing `ASPUnit.run()` call
* `aspunit.error.onError` `(message, stackTrace)`

You may listen for these events like so:

```js
grunt.event.on('aspunit.spawn', function (url) {
  grunt.log.ok("Running test: " + url);
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_