import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'

const tableName = 'sources';
const sources: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/sources', async function (request, reply) {
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

  fastify.post('/source', async function (request, reply) {
    const bodyStr = request.body as string;
    const client = await fastify.pg.connect();
    try {
      const body: {sourceLabel: string} = JSON.parse(bodyStr);
      await client.query(
        generics.insert(tableName, ['source_label']),
        [body.sourceLabel]
      );

      return true;
    } finally {
      client.release();
    }
  })
}

export default sources;
