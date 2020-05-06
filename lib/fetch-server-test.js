import isFunction from 'lodash/isFunction';
import intersection from 'lodash/intersection';
import difference from 'lodash/difference';

import * as sinon from 'sinon';

const VALID_METHODS = [`GET`, `POST`, `PATCH`, `PUT`, `DELETE`];

/**
 * Utility class to stub fetch requests with sinon. Instantiate with a set of
 * route handlers mapping URL (sub)strings to canned response values, or functions
 * which return canned responses/response values. Values will be serialized as JSON
 * and returned in a Fetch-like Promise object.
 *
 * @example
 * const fetchServer = new FetchServer({
 *   '/foo.json': 'bar',
 *   '/baz/quux': (url, params) => !!params.foo ? 'a' : 'z',
 * }, {debug: true});
 * fetchServer.start();
 * const res = await fetch('https://myserver/foo.json');
 * const val = await res.json(); // 'bar'
 * 
 * @example 
 * You can also have the following handler types where key is any of the HTTP methods
 * const handler = {
 *   '/foo/bar`: {
 *      GET: {
 *        'content-type': 'application/json',
 *        'status': 200,
 *        'result': {}
 *      },
 *      // Takes a non-async function, and creates Promise
 *      POST: (url, params) => ({
 *        'content-type': 'text/html',
 *        'status': 200,
 *        'result': {}
 *      })
 *   }
 * }
 */
export class FetchServer {
  constructor(handlers, {debug = false} = {}) {
    this.handlers = handlers;
    this.debug = debug;
    this.handle = this.handle.bind(this);
  }

  handle(url, params) {
		// default method GET
    const HTTPmethod = params.method || `GET`;
    let response;
    for (const [route, handler] of Object.entries(this.handlers)) {
      
      // Block 1 : parses body
      if (url.includes(route)) {
        if (params && params.body) {
					try {
						params = JSON.parse(params.body);
					} catch (e) {
						if (e instanceof SyntaxError) {
							// not JSON parse-able, must be a string
              params = params.body;
						} else {
							throw new Error(`Invalid body: ${params.body}`);
						}
					}
				}
        
        // handler is either normal or async function. 
        if (isFunction(handler)) response = handler(url, params);
        
        // handler is an object that is either
        /**
         * const obj = {
         *  token: 'xyz',
         *  token-x: 'xxyz'
         * }
         * OR
         * const obj = {
         *  GET: {},
         *  POST: function, // can be async or non-async
         * }
         */
				else {
          const keys = Object.keys(handler);

          // keys validity check
          // if keys include any of the HTTP methods -> all the keys need to be valid
          const hasHttpMethod = keys.reduce((item, result) => {
            return result && VALID_METHODS.includes(item);
          }, true);

          // if keys has all valid http methods          
					if (intersection(keys, VALID_METHODS).length === keys.length) {
						for (const [method, methodHandler] of Object.entries(handler)) {
              if (HTTPmethod === method && method === `GET`) {
                response = methodHandler;
              } else if (HTTPmethod === method) {
                response = methodHandler(url, params);
							} 
            }
          }
          // keys have non-http methods
					else {
            // if http method mixed with fixture objects
            if (difference(keys, VALID_METHODS).length !== keys.length) {
              throw Error("Can't mix HTTP methods w/ other handlers.");
            }
						response = handler; // fixture style handler object
					}
				}
				
        // Not yet promise-like
        if (!response.then) {
          // serializable value, wrap in fetch-like Promise
          const responseOptions = {
            status: 200,
            headers: {
              'Content-Type': `application/json`,
            },
          };
          response = Promise.resolve(new Response(JSON.stringify(response), responseOptions));
        }
        this.debugLog({url, params, response});
        return response;
      }

    }

    throw new Error(`Unexpected fetch: ${url} params: ${JSON.stringify(params)}`);
  }


  start() {
    if (window.fetch.hasOwnProperty(`restore`)) {
      window.fetch.restore();
    }
    sinon.stub(window, `fetch`).callsFake(this.handle);
  }

  debugLog({url, params, response}) {
    if (this.debug) {
      const responseObjectPromise = response.then(r => r.clone());
      const responseBodyPromise = responseObjectPromise.then(clonedResponse => clonedResponse.json());
      Promise.all([responseObjectPromise, responseBodyPromise]).then(([response, responseBody]) => {
        console.groupCollapsed(`[fetch-server] ${url}`);
          console.groupCollapsed('Params');
            console.log(JSON.stringify(params, null, 2));
          console.groupEnd();
          console.groupCollapsed('Response');
            console.log(JSON.stringify(response, null, 2));
          console.groupEnd();
          console.group('Response Body');
            console.log(JSON.stringify(responseBody, null, 2));
          console.groupEnd();
        console.groupEnd();
      })
    }
  }
}
