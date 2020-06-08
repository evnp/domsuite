/**
 * Exports different handler objects for fetch-server tests
 */


/**
 * Valid http methods handler
 */
export const httpMethodsHandler = {
  '/some/route': {
      GET: {
          'content-type': 'application/json',
          'status': 200,
          'result': { key: 'GET' },
      },
      POST: (_url, _params) => {
          return {
              'content-type': 'text/html',
              'status': 200,
              result: { key: 'POST' },
          }
      },
      PATCH: (_url, _params) => {
          return {
              'content-type': 'text/html',
              'status': 200,
              result: { key: 'PATCH' },
          }
      },
      PUT: (_url, _params) => {
          return {
              'content-type': 'text/html',
              'status': 200,
              result: { key: 'PUT' },
          }
      },
      DELETE: (_url, _params) => {
          return {
              'content-type': 'text/html',
              'status': 200,
              result: { key: 'DELETE' },
          }
      }
  }
}

/**
 * Valid http methods handler
 * GET method can have only fixture object
 */
const fixtureData = {
    'result': 'some result'
}
export const getHasOnlyFixture = {
    '/foo/bar': {
	  GET: fixtureData
	},
}

/**
 * Valid http methods handler
 * GET method can have async handler
 */
const asyncCall = {};
asyncCall.promise = new Promise((resolve) => (asyncCall.resolve = resolve));
export const getHasAsyncHandler = {
    '/foo/bar': {
        GET: async (_url, _params) => {
            const results = await asyncCall.promise;
            return {
                'content-type': 'json/application',
                'status': 200,
                result: { key: 'GET' },
            }
        }
    }
}

/**
 * Valid http methods handler
 * method can have non-async handler
 */
export const getHasNonAsyncHandler = {
    '/foo/bar': {
        GET: async (_url, _params) => {
            return {
                'content-type': 'json/application',
                'status': 200,
                result: { key: 'GET' },
            }
        }
    }
}

/**
 * Invalid http methods handler
 * Can't mix http methods with non-http methods
 */
export const invalidMixedHandlers = {
  '/some/route': {
    GOT: { // GOT is not a valid handler
      'content-type': 'application/json',
      'status': 200,
      'result': { key: 'GET'},
    },
    POST: (_url, _params) => {
      return {
          'content-type': 'text/html',
          'status': 200,
          result: { key: 'POST' },
      }
    },
  }
};

/**
 * Backward compatibility test
 * Default GET handler
 */
export const defaultGetHandler = {
  '/auth': {
    token: `some-token`,
    'x-token': `some-token`,
  }
}