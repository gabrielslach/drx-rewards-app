import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'

const tableName = "customer";
const customers: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/customers', async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const { rows } = await client.query(
        generics.selectAll(tableName)
      );

      return rows;
    } finally {
      client.release();
    }
  })

  fastify.post('/customer', async function (request, reply) {
    const bodyStr = request.body as string;
    const client = await fastify.pg.connect();
    try {
      const body: {name: string} = JSON.parse(bodyStr);
      await client.query(
        generics.insert(tableName, ['name']),
        [body.name]
      );

      return true;
    } finally {
      client.release();
    }
  })
}

export default customers;
