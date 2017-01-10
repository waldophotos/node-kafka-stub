/**
 * @fileOverview A testing library for node-kafka.
 */
const cip = require('cip');
const sinon = require('sinon');
const Promise = require('bluebird');

/**
 * Main exposed function, will create a new instance of kafka stub
 * and return it.
 *
 * @return {KafkaStub} A KafkaStub instance.
 */
const kafkaStub = module.exports = function(nodeKafka) {
  const stub = new kafkaStub.KafkaStub(nodeKafka);
  return stub;
};

/**
 * The kafka stub core.
 *
 * @constructor
 */
kafkaStub.KafkaStub = cip.extend(function(nodeKafka) {
  this.nodeKafka = nodeKafka;
  this.produceStub = null;
  this.consumerConnectStub = null;
  this.produceOrig = this.nodeKafka.Producer.prototype.produce;
  this.consumerTopics = {};

  this.mutedTopics = [];
});

/**
 * Reset the stubs.
 *
 */
kafkaStub.KafkaStub.prototype.reset = function() {
  this.restore();
  this.stub();
  this.mutedTopics = [];
};

/**
 * Mute a topic from executing the consumer listeners.
 *
 * @param {string} topic The topic to mute.
 */
kafkaStub.KafkaStub.prototype.mute = function(topic) {
  this.mutedTopics.push(topic);
};

/**
 * Stub the node-kafka package.
 *
 */
kafkaStub.KafkaStub.prototype.stub = function() {
  const self = this;

  this.produceStub = sinon.stub(this.nodeKafka.Producer.prototype, 'produce',
    function(data) {
      console.log('Produce stub on topic:', this.topic);
      if (self.consumerTopics[this.topic] &&
        self.mutedTopics.indexOf(this.topic) === -1) {

        console.log('Produce found topic consumers:', self.consumerTopics[this.topic].length);
        self.consumerTopics[this.topic].forEach(function(opts) {
          opts.onMessage({
            value: data,
          });
        });
      }

      return Promise.resolve();
    });


  this.consumerConnectStub = sinon.stub(this.nodeKafka.Consumer.prototype,
    'connect', function(opts) {
      self.consumerTopics[this.topic] = self.consumerTopics[this.topic] || [];
      self.consumerTopics[this.topic].push(opts);

      console.log('Added consumer stub for topic:', this.topic);

      return Promise.resolve();
    });
};

/**
 * Restore stubbed methods.
 *
 */
kafkaStub.KafkaStub.prototype.restore = function() {
  if (!this.produceStub) {
    return;
  }
  this.produceStub.restore();
  this.produceStub = null;
  this.consumerConnectStub.restore();
  this.consumerConnectStub = null;
};

/**
 * Invoke the original node-kafka produce method.
 *
 * @param {Object} ctx Context, provide the required Producer instance here.
 * @param {Object} data Object to pass on to the produce method.
 * @return {Promise} A Promise.
 */
kafkaStub.KafkaStub.prototype.produce = function(ctx, data) {
  return this.produceOrig.call(ctx, data);
};
