import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'

const tableName = "category";
const categories: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/categories', async function (request, reply) {
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

  fastify.post('/category', async function (request, reply) {
    const bodyStr = request.body as string;
    const client = await fastify.pg.connect();
    try {
      const body: {type: string, name: string} = JSON.parse(bodyStr);
      await client.query(
        generics.insert(tableName, ['type', 'name']),
        [body.type, body.name]
      );

      return true;
    } finally {
      client.release();
    }
  })
}

export default categories;
