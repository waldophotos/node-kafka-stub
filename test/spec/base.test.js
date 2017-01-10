/**
 * @fileOverview Base API Surface tests.
 */
const chai = require('chai');
const expect = chai.expect;
const kafkaLib = require('@waldo/node-kafka');

const kafkaStub = require('../..');


describe('Base API Surface', function() {
  it('should expose expected methods', function(){
    expect(kafkaStub).to.be.a('function');
  });

  it('should expose expected methods after instanciated', function(){
    const stub = kafkaStub(kafkaLib);
    expect(stub).to.have.keys([
      'reset',
      'mute',
      'stub',
      'restore',
      'produce',
    ]);
  });
});
