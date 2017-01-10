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

    expect(stub.reset).to.be.a('function');
    expect(stub.mute).to.be.a('function');
    expect(stub.stub).to.be.a('function');
    expect(stub.restore).to.be.a('function');
    expect(stub.produce).to.be.a('function');
  });
});
