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
  
  const sourceSchema = {
    body: {
      type: "object",
      properties: {
        sourceLabel: {
          type: "string",
        }
      },
      required: ['sourceLabel']
    },
    response: {
      success: {
        type: "boolean"
      }
    }
  }

  type postSourceBody = {
    sourceLabel: string
  }

  fastify.post<{ Body: postSourceBody }>('/source', { schema: sourceSchema }, async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const body = request.body;
      await client.query(
        generics.insert(tableName, ['label']),
        [body.sourceLabel]
      );

      return { success: true };
    } finally {
      client.release();
    }
  })
}

export default sources;
