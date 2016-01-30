'use strict';
const _ = require('lodash');
const request = require('superagent');
const urlJoin = require('url-join');
const privateData = new WeakMap();

function end(req) {
	return new Promise((resolve, reject) => {
		req.end((err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res);
			}
		});
	});
}

class Client {
	constructor(options) {
		options = _.extend({
			host: '127.0.0.1',
			port: 2379,
			version: 'v2',
			key: ''
		}, options);
		privateData.set(this, {
			options: options,
			config: {},
			tags: [],
			ttl: 0,
			key: ''
		});
	}
	
	ttl(v) {
		privateData.get(this).ttl = v;
		return this;
	}

	set(k, v) {
		const config = privateData.get(this).config;
		if (_.isObject(k)) {
			_.extend(config, k);
		} else {
			config[k] = v;
		}
		return this;
	}

	list() {
		const tags = privateData.get(this).tags;
		const data = privateData.get(this);
		const options = data.options;
		const url = urlJoin(this._getUrl(options), options.key);
		const filter = (arr) => {
			const result = [];
			_.forEach(arr, tmp => {
				let exists = true;
				_.forEach(tags, tag => {
					if (exists && ~_.indexOf(tmp.tags, tag)) {
						exists = false;
					}
				});
				if (exists) {
					result.push(tmp.config);
				}
			});
		};

		return end(request.get(url)).then(res => {
			const nodes = _.get(res, 'body.node.nodes');
			const arr = _.map(nodes, node => {
				return JSON.parse(node.value);
			}); 
			return filter(arr);
		});
	}

	addTag() {
		const tags = privateData.get(this).tags;
		const arr = _.flattenDeep(_.toArray(arguments));
		_.forEach(arr, tag => {
			if (!~_.indexOf(tags, tag)) {
				tags.push(tag);
			}
		});

		return this;
	}

	refresh() {
		const data = privateData.get(this);
		const url = urlJoin(this._getUrl(data.options), data.key);
		const value = {
			config: data.config,
			tags: data.tags
		};
		const sendData = {
			value: JSON.stringify(value)
		};
		if (data.ttl) {
			sendData.ttl = data.ttl;
		}
		
		const req = request.put(url)
			.type('form')
			.send(sendData);
		return end(req).then(res => {
			return _.get(res, 'body.node');
		});
	}

	_getUrl(options) {
		return `http://${options.host}:${options.port}/${options.version}/keys`;
	}

	register() {
		const data = privateData.get(this);
		const options = data.options;
		const value = {
			config: data.config,
			tags: data.tags
		};
		const sendData = {
			value: JSON.stringify(value)
		};
		if (data.ttl) {
			sendData.ttl = data.ttl;
		}
		const url = urlJoin(this._getUrl(options), options.key);

		const req = request.post(url)
			.type('form')
			.send(sendData);
		return end(req).then(res => {
			const node =  _.get(res, 'body.node');
			data.key = node.key;
			return node;
		});
	}
}

module.exports = Client;