# node-kafka-stub

> Stubbing methods for node-kafka library

[![CircleCI](https://circleci.com/gh/waldophotos/node-kafka-stub/tree/master.svg?style=svg&circle-token=ea338d200eaca1b2ce099ca59784ff17466dc60b)](https://circleci.com/gh/waldophotos/node-kafka-stub/tree/master)

## Install

Install the module using NPM:

```
npm install @waldo/node-kafka-stub --save-dev
```

## Documentation

This library provides a complete stubbing solution for the `@waldo/node-kafka` package, it stubs both the consumers and the producers allowing to perform tests in a closed cycle.

Effectively, with this library, you no longer need a running kafka server to perform tests into your kafka dependent service.

### Quick Start

```js
const kafkaLib = require('@waldo/node-kafka');
const kafkaStub = require('@waldo/node-kafka-stub')(kafkaLib);
```

By performing the Dependency Injection (the `kafkaLib` argument) you get a new instance of the kafkaStub.

> BEWARE: Each new instance has different internal counters, so it is advisable that you create and retain a single Kafka Stub instance throughout your testing.

### Architecture

In order for this library to be effective the `@waldo/node-kafka` library has to be loaded on the same runtime. That means, the same process that runs the tests has to also launch and run the service / application.

This can be accomplished if you wrap the whole bootstrap process of your application within the context of an exposed function. Using the following hack you can determine if your application should launch since it was directly executed or do nothing because it was required as a library, from your testing infrastructure:

#### app.js

```js
const Promise = require('bluebird');

const isStandAlone = require.main === module;

const app = module.exports = {};

app.init = Promise.method(function() {
    // do your async stuff here, return a promise.
});


if (isStandAlone) {
  app.init();
}
```

That way, your application can be required and manually initialized by your testing infrastructure. A good practice to enforce a "testing infrastructure" is to make sure all your tests require and `init()` a common testing library. Here is a working example of such [a common test library on the dropbox service repo](https://github.com/waldophotos/waldo-input-dropbox/blob/master/test/lib/test.lib.js).

### Stub

To perform stubbing simply invoke the `stub()` method:

```js
kafkaStub.stub();
```

This method will stub both the consumer and the producer operations of the node-kafka library. The stubbing happens using the [sinon library](http://sinonjs.org/). The `Consumer.connect` and `Producer.produce` methods are fully stubbed with special functions that handle both calls and allow for granular control on the topics produced and consumed. The sinon outcome of this stubbing is two spies that you can examine and use in your tests:

* `kafkaStub.produceStub` Sinon Spy for the `Producer.produce()` method.
* `kafkaStub.consumerConnectStub` Sinon spy for the `Consumer.connect()` method.

Example on how to use the spy for examining the message produced by your service:

```js

it('should perform an operation', function(done) {

  setTimeout(() => {
    // Since we started the service operation with a produced message
    // and the outcome of our service's processing is a new kafka message
    // then we expect 2 calls to the Produce.produce() method:
    expect(testLib.kafkaStub.produceStub.callCount).to.equal(2);

    // get the produced message of the service, which is the second:
    const msg = testLib.kafkaStub.produceStub.getCall(1).args[0];

    expect(msg.key).to.be.a('string');
    expect(msg.value).to.be.an('object');
  }, 4000);

  // Produce a message that triggers your service to operate
  kafkaTestLib.produceTreeSearch(this.treeSearchMessageFix)
    .catch(done);
});
```

### Restore

Restore releases the Sinon stubs but does not reset the internal counters and data stores. Mostly reserved for internal use, use [Reset](#reset) instead.

```js
kafkaStub.restore();
```

### Reset

The `reset()` method will reset all internal and sinon counters and it is advisable that you run it before each of your tests run.

```js
beforeEach(function() {
    kafkaStub.reset();
});
```

The reset method ensures that stubs are restored and muted methods are cleared. All of your service's consumers and producers will continue to operate.

### Mute

You can selectively mute the production of messages on specific topics. This is particularly useful if you want to stop a chain reaction that your service operates on.

```js
beforeEach(function() {
    kafkaStub.mute('KafkaTopicToMute');
});
```

Muting will ensure the consumers on this topic will never get the produced message.

## Releasing

1. Update the changelog bellow.
1. Ensure you are on master.
1. Type: `grunt release`
    * `grunt release:minor` for minor number jump.
    * `grunt release:major` for major number jump.

## Release History

- **v0.0.1**, *TBD*
    - Big Bang

## License

Copyright Waldo, Inc. All rights reserved.
