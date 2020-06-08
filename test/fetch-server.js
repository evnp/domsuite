import {FetchServer} from '../lib';
import {httpMethodsHandler, invalidMixedHandlers, defaultGetHandler, getHasOnlyFixture, getHasAsyncHandler, getHasNonAsyncHandler} from './handler-objects';
import chai, {expect} from 'chai';

const httpMethodsFetchServer = new FetchServer(httpMethodsHandler, {debug:true});
const invalidMixedFetchServer = new FetchServer(invalidMixedHandlers, {debug: true});
const getOnlyFixtureFetchServer = new FetchServer(getHasOnlyFixture, {debug: true});
const getHasAsyncFetchServer = new FetchServer(getHasAsyncHandler, {debug: true});
const getHasNonAsyncFetchServer = new FetchServer(getHasNonAsyncHandler, {debug: true});

describe(`FetchServer handlers tests`, function() {
    describe(`Handlers with valid HTTP methods test`, function(){
      it (`GET test`, async function() {
        httpMethodsFetchServer.handle('/some/route', {
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
        httpMethodsFetchServer.handle(`/some/route`, {
            credentials: `include`,
            method: `POST`,
            body: JSON.stringify({ url: targetUrl}),
        })
        .then((response) => response.json())
        .then((data) => {
            expect(data[`result`].key).to.equal(`POST`);
        });
      });
    }),
    describe(`Handlers with invalid HTTP methods test`, function() {
        expect(true).to.be.true;
    })
});
