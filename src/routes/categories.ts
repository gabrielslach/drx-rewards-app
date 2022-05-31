import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'

const tableName = "categories";
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

  const categorySchema = {
    body: {
      type: "object",
      properties: {
        type: {
          type: "string",
        },
        name: {
          type: "string",
        }
      },
      required: ['type', 'name']
    },
    response: {
      success: {
        type: "boolean"
      }
    }
  }

  type postCategoryBody = {
    type: string;
    name: string;
  }

  fastify.post<{Body: postCategoryBody}>('/category', { schema: categorySchema }, async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const body = request.body;
      await client.query(
        generics.insert(tableName, ['type', 'name']),
        [body.type, body.name]
      );

      return { success: true };
    } finally {
      client.release();
    }
  })
}

export default categories;
