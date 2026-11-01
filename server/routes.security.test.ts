import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, Server } from 'node:http';
import apiRouter from './routes';

describe('order privacy routes', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', apiRouter);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port');
    baseUrl = `http://127.0.0.1:${address.port}/api`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it('does not expose the order list to anonymous visitors', async () => {
    const response = await fetch(`${baseUrl}/orders`);
    assert.equal(response.status, 401);
    const body = await response.json() as { success?: boolean };
    assert.equal(body.success, false);
  });

  it('does not expose an order by ID or order number to anonymous visitors', async () => {
    const response = await fetch(`${baseUrl}/orders/ord-private-record`);
    assert.equal(response.status, 401);
    const body = await response.json() as { success?: boolean };
    assert.equal(body.success, false);
  });

  it('does not allow phone-number filtering to bypass order authentication', async () => {
    const response = await fetch(`${baseUrl}/orders?phone=0550000000`);
    assert.equal(response.status, 401);
  });
});
