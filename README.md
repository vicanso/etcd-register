# micro-service

## API

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

## License

MIT