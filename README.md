# micro-service

[![Build Status](https://travis-ci.org/vicanso/micro-service.svg?branch=master)](https://travis-ci.org/vicanso/micro-service)
[![npm](http://img.shields.io/npm/v/micro-service.svg?style=flat-square)](https://www.npmjs.org/package/micro-service)
[![Github Releases](https://img.shields.io/npm/dm/micro-service.svg?style=flat-square)](https://github.com/vicanso/micro-service)

## API

### register

```js
const MicroService = require('micro-service');
const client = new MicroService({
	key: 'backend',
	host: '127.0.0.1',
	port: 2379
});

client.set({
	ip: '192.168.1.1',
	port: 80,
	host: 'test.com',
	prefix: '/albi'
});
client.ttl(600);
client.addTag('http-backend', 'app-albi', 'http-ping');
client.register();
```

### list

```js
const MicroService = require('micro-service');
const client = new MicroService({
	key: 'backend',
	host: '127.0.0.1',
	port: 2379
});
client.list('backend:http').then(data => {
	console.info(data);
});
```

### refresh

```js
const MicroService = require('micro-service');
const client = new MicroService({
	key: 'backend',
	host: '127.0.0.1',
	port: 2379
});

client.set({
	ip: '192.168.1.1',
	port: 80,
	host: 'test.com',
	prefix: '/albi'
});
client.ttl(600);
client.addTag('http-backend', 'app-albi', 'http-ping');
client.register();
setTimeout(() => {
	client.refresh();
}, 60 * 1000);
```

## License

MIT