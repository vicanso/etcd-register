'use strict';
const assert = require('assert');
const Client = require('..');

describe('micro-service', () => {
  const client = new Client('http://127.0.0.1:2379/v2', {
    key: 'micro-service-test'
  });
  const serviceConfig = {
    port: 80,
    ip: '127.0.0.1',
    prefix: '/test'
  };
  const serviceTags = ['backend:http', 'env:test', 'micro-service:test'];
  client.set(serviceConfig);
  client.set('host', 'micro.com');
  client.addTag(serviceTags);
  client.ttl(60);

  it('should register success', done => {
    client.register().then(data => {
      const value = data.value;
      assert.equal(data.ttl, 60);
      assert(data.key);
      assert.equal(JSON.stringify(value.config), '{"port":80,"ip":"127.0.0.1","prefix":"/test","host":"micro.com"}');
      assert.equal(value.tags.join(), serviceTags.join());
      done();
    }).catch(done);
  });

  it('should list config by filter tag', done => {
    client.list(['backend:http', 'env:test'])
      .then(data => {
        assert(data.length);
        const tags = data[0].value.tags;
        assert.notEqual(tags.indexOf('backend:http'), -1);
        assert.notEqual(tags.indexOf('env:test'), -1);
        done();
      }).catch(done);
  });

  it('should list config empty by filter no-exists tag', done => {
    client.list('test')
      .then(data => {
        assert.equal(data.length, 0);
        done();
      })
      .catch(done);
  });

  it('should list all data', done => {
    client.list()
      .then(data => {
        assert.notEqual(data.length, 0);
        done();
      })
      .catch(done);
  });

  it('should refresh ttl success', done => {
    setTimeout(() => {
      client.refresh().then(data => {
        assert.equal(data.ttl, 60);
        done();
      }).catch(done);
    }, 1000);
  });

});