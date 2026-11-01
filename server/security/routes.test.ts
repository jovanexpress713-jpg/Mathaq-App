import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import { test } from 'node:test';
import apiRouter from '../routes';

test('order listing and order details reject unauthenticated visitors', async () => {
  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}/api`;

    const listResponse = await fetch(`${baseUrl}/orders`);
    assert.equal(listResponse.status, 401);

    const detailResponse = await fetch(`${baseUrl}/orders/ord-private-test`);
    assert.equal(detailResponse.status, 401);
  } finally {
    server.close();
    await once(server, 'close');
  }
});
