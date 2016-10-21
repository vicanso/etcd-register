'use strict';

const _ = require('lodash');
const request = require('superagent');
const urlJoin = require('url-join');

const privateData = new WeakMap();

class Client {
  constructor(url, options) {
    const opts = _.extend({
      key: '',
    }, _.isObject(url) ? url : options);
    const etcdUrl = _.isString(url) ? url : 'http://127.0.0.1:2379/v2';
    privateData.set(this, {
      url: etcdUrl,
      options: opts,
      config: {},
      tags: [],
      ttl: 0,
      key: '',
    });
  }
  /**
   * [ttl 设置ttl]
   * @param  {[type]} v [description]
   * @return {[type]}   [description]
   */
  ttl(v) {
    privateData.get(this).ttl = v;
    return this;
  }

  /**
   * [set 设置value的值]
   * @param {[type]} k [description]
   * @param {[type]} v [description]
   */
  set(k, v) {
    const config = privateData.get(this).config;
    if (_.isObject(k)) {
      _.extend(config, k);
    } else {
      config[k] = v;
    }
    return this;
  }

  /**
   * [list description]
   * @return {[type]} [description]
   */
  list() {
    /* eslint prefer-rest-params:0 */
    const tags = _.flattenDeep(_.toArray(arguments));
    const data = privateData.get(this);
    const options = data.options;
    const url = urlJoin(this.getUrl(), options.key);
    const filter = (node) => {
      let exists = true;
      _.forEach(tags, (tag) => {
        if (exists && _.indexOf(node.value.tags, tag) === -1) {
          exists = false;
        }
      });
      return exists;
    };

    return request.get(url).then((res) => {
      const nodes = _.get(res, 'body.node.nodes');
      _.forEach(nodes, (tmp) => {
        const node = tmp;
        node.value = JSON.parse(node.value);
      });
      if (tags.length) {
        return _.filter(nodes, filter);
      }
      return nodes;
    });
  }

  addTag() {
    const tags = privateData.get(this).tags;
    const arr = _.flattenDeep(_.toArray(arguments));
    _.forEach(arr, (tag) => {
      /* istanbul ignore else */
      if (_.indexOf(tags, tag) === -1) {
        tags.push(tag);
      }
    });

    return this;
  }

  refresh() {
    const data = privateData.get(this);
    const url = urlJoin(this.getUrl(), data.key);
    const value = {
      config: data.config,
      tags: data.tags,
    };
    const sendData = {
      value: JSON.stringify(value),
    };
    /* istanbul ignore else */
    if (data.ttl) {
      sendData.ttl = data.ttl;
    }

    return request.put(url)
      .type('form')
      .send(sendData)
      .then((res) => {
        const node = _.get(res, 'body.node');
        node.value = JSON.parse(node.value);
        return node;
      });
  }

  getUrl() {
    const data = privateData.get(this);
    return `${data.url}/keys`;
  }

  register() {
    const data = privateData.get(this);
    const options = data.options;
    const value = {
      config: data.config,
      tags: data.tags,
    };
    const sendData = {
      value: JSON.stringify(value),
    };
    /* istanbul ignore else */
    if (data.ttl) {
      sendData.ttl = data.ttl;
    }
    const url = urlJoin(this.getUrl(), options.key);
    return request.post(url)
      .type('form')
      .send(sendData)
      .then((res) => {
        const node = _.get(res, 'body.node');
        node.value = JSON.parse(node.value);
        data.key = node.key;
        return node;
      });
  }
}

module.exports = Client;
