import {FetchServer} from '../lib';
import chai, {expect} from 'chai';

const httpMethodsHandler = {
  '/some/route': {
      GET: {
          'content-type': 'application/json',
          'status': 200,
          'result': { key: 'GET'},
      },
      POST: (_url, _params) => { // this cound be async or non-async. if non-async response needs to be promisfiable
          return {
              'content-type': 'text/html',
              'stuats': 200,
              result: {key: 'POST'},
          }
      },
      PATCH: (_url, _params) => {
          return {
              'content-type': 'text/html',
              'stuats': 200,
              result: {key: 'PATCH'},
          }
      },
      PUT: (_url, _parms) => {
          return {
              'content-type': 'text/html',
              'stuats': 200,
              result: {key: 'PUT'},
          }
      },
      DELETE: (_url, _params) => {
          return {
              'content-type': 'text/html',
              'stuats': 200,
              result: {key: 'DELETE'},
          }
      }
  }
}

// This should NOT be allowed
// either GOT -> GET OR
// Get rid of POST.
const mixedHandlers = {
  '/some/route': {
    GOT: {
      'content-type': 'application/json',
      'status': 200,
      'result': { key: 'GET'},
    },
    POST: (_url, _params) => { 
      return {
          'content-type': 'text/html',
          'stuats': 200,
          result: {key: 'POST'},
      }
    },
  }
};

const previousHandler = {
  '/auth': {
    token: `xyz`,
    'x-token': `sce`,
  }
}


const fetchServer = new FetchServer(httpMethodsHandler, {debug:true})


describe(`FetchServer`, function() {
  it (`GET test`, async function() {
    // Get should not send any body
    fetchServer.handle('/some/route', {
      credentials: `include`,
      method: `GET`,
    })
    .then((response) => response.json())
    .then((data) => {
      expect(data[`result`].key).to.equal(`GET`);
    });
  });

  it(`POST test`, async function() {
    let targetUrl = 'www.google.com';
    fetchServer.handle(`/some/route`, {
        credentials: `include`,
        method: `POST`,
        body: JSON.stringify({ url: targetUrl}),
      })
      .then((response) => response.json())
      .then((data) => {
        expect(data[`result`].key).to.equal(`POST`);
      });
  });

  it (`fetch body is just a string`, async function() {
    fetchServer.handle(`/some/route`, {
      credentials: `include`,
      method: `POST`,
      body: 'www.google.com',
    })
    .then((response) => response.json())
    .then((data) => {
      expect(data[`result`].key).to.equal(`POST`);
    });
  })

  it (`should fail when handler has invalid HTTP method`, async function() {
    const invalidFetchServer = new FetchServer(mixedHandlers, {debug:true});
    try{
      // Should be disallowed
      invalidFetchServer.handle(`/some/route`, {
        credentials: `include`,
        method: `GET`,
        body: `www.google.com`,
      })
    .then((response) => response.json())
    .then((data) => {
      expect(data[`GOT`][`result`].key).to.equal(`GET`);
    });
    } catch (e) {
      expect(e.message).to.equal("Can't mix HTTP methods w/ other handlers.")
    }

    try {
      invalidFetchServer.handle(`/some/route`, {
        credentials: `include`,
        method: `POST`,
        body: `www.google.com`,
      })
      .then((response) => response.json())
      .then((data) => {
        expect(data[`result`].key).to.equal(`POST`);
      });
    } catch (e) {
      expect(e.message).to.equal("Can't mix HTTP methods w/ other handlers.")
    }
  })

  it (`fixture object with more than one key`, async function() {
    const invalidFetchServer = new FetchServer(previousHandler, {debug:true});
    invalidFetchServer.handle(`/auth`, {
      credentials: `include`,
      method: `POST`,
      body: `www.google.com`,
    })
    .then((response) => response.json())
    .then((data) => {
      expect(data[`token`]).to.equal(`xyz`);
    })
  })

});
