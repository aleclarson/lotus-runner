
# lotus-runner v1.0.0 [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

```sh
npm install aleclarson/lotus-runner#1.0.0
```

&nbsp;

## usage

```CoffeeScript
Runner = require "lotus-runner/runner"

runner = Runner
  suite: "lotus-jasmine"
  reporter: "lotus-jasmine/reporter"

runner.start "js/spec"
```

&nbsp;

## suites

A "suite" controls which testing framework is used; and how.

Every suite must export an `Object` literal with these properties:

#### path

&nbsp;&nbsp;
A `String` that leads to the testing framework's entry point. It's used to set `suite.name`, `suite.dir`, and `suite.entry`.

#### load(options)

&nbsp;&nbsp;
A `Function` called to setup the testing framework.

#### start(paths)

&nbsp;&nbsp;
A `Function` called to begin testing.

The passed `paths` can be absolute or relative to `process.cwd()`.

You can pass an `Array` or one to many `String`s.

```CoffeeScript
runner.start "io/js/src", "lotus/js/src"
runner.start ["io/js/src", "lotus/js/src"]
```

&nbsp;

## reporters

A "reporter" controls how test results appear in the terminal.

Every reporter must export an `Object` literal with these properties:

#### startAll(info)

&nbsp;&nbsp;
A `Function` called when all testing starts.

#### finishAll()

&nbsp;&nbsp;
A `Function` called when all testing finishes.

#### startSome(info)

&nbsp;&nbsp;
A `Function` called when a group of tests starts (eg: `describe()` in Jasmine).

#### finishSome(info)

&nbsp;&nbsp;
A `Function` called when a group of tests finishes.

#### startOne(info)

&nbsp;&nbsp;
A `Function` called when a single test starts (eg: `it()` in Jasmine).

#### finishOne(info)

&nbsp;&nbsp;
A `Function` called when a single test finishes.

&nbsp;
