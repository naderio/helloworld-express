# Fetch Helper

## Usage

### Import

```javascript
import * as FetchHelper from '../common/fetch.helper';
```

### `FetchHelper.handle`

```javascript
FetchHelper.handle(fetch('https://httpbin.org/ip'))
  .then(({ meta, data }) => console.log(data))
  .catch((error) => console.error(error));
```

```javascript
try {
  const { meta, data } = await FetchHelper.handle(fetch('https://httpbin.org/ip'));

  console.log(data);
} catch (error) {
  console.error(error, error.extra);
}
```

### `toQueryString`

```javascript
FetchHelper.handle(fetch(`https://httpbin.org/anything?${FetchHelper.toQueryString({ a: 1, b: 2 })}`))
  .then(({ data }) => console.log(data))
  .catch((error) => console.error(error));
```

### `toFormData`

```javascript
FetchHelper.handle(
  fetch('https://httpbin.org/anything', {
    method: 'POST',
    body: FetchHelper.toFormData({ a: 1, b: 2 }),
  }),
)
  .then(({ data }) => console.log(data))
  .catch((error) => console.error(error));
```

### `Request`

```javascript
FetchHelper.handle(
  fetch(
    FetchHelper.Request('GET', 'https://httpbin.org/anything/:token', {
      route: { token: '123456789' },
      query: { a: 1, b: 2 },
      body: { a: 1, b: 2 },
    }),
  ),
)
  .then(({ data }) => console.log(data))
  .catch((error) => console.error(error));
```

### Success Listener

```javascript
FetchHelper.events.on('success', ({ meta, data }) => {
  console.log(meta.status, data);
});
```

### Failure Listener

```javascript
FetchHelper.events.on('failure', ({ meta, error }) => {
  if (meta.status === 401) {
    console.log('Unauthenticated');
  }
});
```
