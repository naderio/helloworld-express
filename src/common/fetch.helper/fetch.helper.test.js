import * as FetchHelper from './fetch.helper';

const ORIGIN_REGEXP = /^\d+\.\d+\.\d+\.\d+/;

const ENDPOINT = process.env.FETCH_HELPER_TEST_ENDPOINT || 'https://httpbin.org';

test('FetchHelper.toQueryString with empty payload', () => {
  const input = {};

  const output = FetchHelper.toQueryString(input);

  expect(output).toBe('');
});

test('FetchHelper.toQueryString with flat payload', () => {
  const input = {
    undefined,
    null: null,
    boolean1: false,
    boolean2: true,
    number1: 0,
    number2: 1,
    number3: -1,
    string1: 'hello',
    string2: 'world',
    date: new Date('2018-01-01T00:00:00.000Z'),
  };

  const output = FetchHelper.toQueryString(input);

  expect(output).toBe(
    'undefined=&null=null&boolean1=false&boolean2=true&number1=0&number2=1&number3=-1&string1=hello&string2=world&date=2018-01-01T00%3A00%3A00.000Z',
  );
});

test('FetchHelper.toQueryString with nested payload', () => {
  const input = {
    array: [null, false, true, 0, 1, -1, 'hello', 'world', new Date('2018-01-01T00:00:00.000Z')],
    object: {
      null: null,
      boolean1: false,
      boolean2: true,
      number1: 0,
      number2: 1,
      number3: -1,
      string1: 'hello',
      string2: 'world',
      date: new Date('2018-01-01T00:00:00.000Z'),
    },
  };

  const output = FetchHelper.toQueryString(input);

  expect(output).toBe(
    'array%5B0%5D=null&array%5B1%5D=false&array%5B2%5D=true&array%5B3%5D=0&array%5B4%5D=1&array%5B5%5D=-1&array%5B6%5D=hello&array%5B7%5D=world&array%5B8%5D=2018-01-01T00%3A00%3A00.000Z&object%5Bnull%5D=null&object%5Bboolean1%5D=false&object%5Bboolean2%5D=true&object%5Bnumber1%5D=0&object%5Bnumber2%5D=1&object%5Bnumber3%5D=-1&object%5Bstring1%5D=hello&object%5Bstring2%5D=world&object%5Bdate%5D=2018-01-01T00%3A00%3A00.000Z',
  );
});

test('FetchHelper.Request', () => {
  const request = FetchHelper.Request('GET', '/user/:userId/profile');

  expect(request.url).toBe('/user/:userId/profile');
});

test('FetchHelper.Request with route params', () => {
  const request = FetchHelper.Request('GET', '/user/:userId/profile', {
    route: { userId: '123456789' },
  });

  expect(request.url).toBe('/user/123456789/profile');
});

test('FetchHelper.Request with plain object body', async () => {
  const body = {
    name: 'John',
  };

  const request = FetchHelper.Request('POST', '/user/:userId/profile', {
    body,
  });

  expect(request.method).toBe('POST');

  expect(request.url).toBe('/user/:userId/profile');

  expect(request.headers.get('Content-Type')).toBe('application/json');

  expect(await request.text()).toBe(JSON.stringify(body));
});

test('FetchHelper.Request with FormData body', () => {
  const body = {
    name: 'John',
  };

  const request = FetchHelper.Request('POST', '/user/:userId/profile', {
    body: FetchHelper.toFormData(body),
  });

  expect(request.method).toBe('POST');

  expect(request.url).toBe('/user/:userId/profile');

  expect(request.headers.get('Content-Type')).toMatch('multipart/form-data');
});

test('FetchHelper.Request with route and query params', () => {
  const request = FetchHelper.Request('GET', '/user/:userId/profile', {
    route: { userId: '123456789' },
    query: { meta: { fields: ['name', 'email', 'picture'] } },
  });

  expect(request.method).toBe('GET');

  expect(request.url).toBe(
    '/user/123456789/profile?meta%5Bfields%5D%5B0%5D=name&meta%5Bfields%5D%5B1%5D=email&meta%5Bfields%5D%5B2%5D=picture',
  );
});

/**
 * FetchHelper documentation examples
 */

test('FetchHelper Promise success example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/anything`))
    .then(({ data }) => {
      expect(data.origin).toMatch(ORIGIN_REGEXP);
      done();
    })
    .catch((error) => done(error));
});

test('FetchHelper Promise failure example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/status/400`)).catch((error) => {
    expect(error.code).toBe('Invalid');
    expect(error.message).toBe('Invalid request');
    expect(error.extra.text).toBe('');
    done();
  });
});

test('FetchHelper Promise failure example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/status/401`)).catch((error) => {
    expect(error.code).toBe('Unauthenticated');
    expect(error.message).toBe('Unauthenticated');
    // expect(error.extra.text).toBe(''); // @TODO fix
    done();
  });
});

test('FetchHelper Promise failure example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/status/403`)).catch((error) => {
    expect(error.code).toBe('Unauthorized');
    expect(error.message).toBe('Unauthorized');
    expect(error.extra.text).toBe('');
    done();
  });
});

test('FetchHelper Promise failure example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/status/404`)).catch((error) => {
    expect(error.code).toBe('NotFound');
    expect(error.message).toBe('Not found');
    expect(error.extra.text).toBe('');
    done();
  });
});

test('FetchHelper Promise failure example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/status/410`)).catch((error) => {
    expect(error.code).toBe('Unknown');
    expect(error.message).toBe('Unknown error');
    expect(error.extra.text).toBe('');
    done();
  });
});

test('FetchHelper Promise failure example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/status/500`)).catch((error) => {
    expect(error.code).toBe('Server');
    expect(error.message).toBe('Server error');
    expect(error.extra.text).toBe('');
    done();
  });
});

test('FetchHelper async/await success example', async () => {
  const { data } = await FetchHelper.handle(fetch(`${ENDPOINT}/anything`));

  expect(data.origin).toMatch(ORIGIN_REGEXP);
});

test('FetchHelper async/await failure example', async () => {
  try {
    await FetchHelper.handle(fetch(`${ENDPOINT}/status/400`));
  } catch (error) {
    expect(error.code).toBe('Invalid');
    expect(error.message).toBe('Invalid request');
    expect(error.extra.text).toBe('');
  }
});

test('FetchHelper.toQueryString example', (done) => {
  FetchHelper.handle(fetch(`${ENDPOINT}/anything?${FetchHelper.toQueryString({ a: 1, b: 2 })}`))
    .then(({ data }) => {
      expect(data.origin).toMatch(ORIGIN_REGEXP);
      expect(data.args).toEqual({ a: '1', b: '2' });
      done();
    })
    .catch((error) => done(error));
});

test('FetchHelper.toFormData example', (done) => {
  FetchHelper.handle(
    fetch(`${ENDPOINT}/anything`, {
      method: 'POST',
      body: FetchHelper.toFormData({ a: 1, b: 2 }),
    }),
  )
    .then(({ data }) => {
      expect(data.origin).toMatch(ORIGIN_REGEXP);
      expect(data.form).toEqual({ a: '1', b: '2' });
      done();
    })
    .catch((error) => done(error));
});

test('FetchHelper.Request example', (done) => {
  FetchHelper.handle(
    fetch(
      FetchHelper.Request('POST', `${ENDPOINT}/anything/:token`, {
        route: { token: '123456789' },
        query: { a: 1, b: 2 },
        body: { a: 1, b: 2 },
      }),
    ),
  )
    .then(({ data }) => {
      expect(data.origin).toMatch(ORIGIN_REGEXP);
      expect(data.url).toBe(`${ENDPOINT}/anything/123456789?a=1&b=2`);
      expect(data.args).toEqual({ a: '1', b: '2' });
      expect(data.json).toEqual({ a: 1, b: 2 });
      done();
    })
    .catch((error) => done(error));
});
