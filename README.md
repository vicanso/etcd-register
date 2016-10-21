# etcd-register

[![Build Status](https://travis-ci.org/vicanso/etcd-register.svg?branch=master)](https://travis-ci.org/vicanso/etcd-register)
[![npm](http://img.shields.io/npm/v/etcd-register.svg?style=flat-square)](https://www.npmjs.org/package/etcd-register)
[![Github Releases](https://img.shields.io/npm/dm/etcd-register.svg?style=flat-square)](https://github.com/vicanso/etcd-register)

## API

### register

```js
const EtcdRegister = require('etcd-register');
const client = new EtcdRegister({
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
const EtcdRegister = require('etcd-register');
const client = new EtcdRegister({
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
const EtcdRegister = require('etcd-register');
const client = new EtcdRegister({
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