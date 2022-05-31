import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'

const tableName = "customers";
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

  const customerSchema = {
    body: {
      type: "object",
      properties: {
        name: {
          type: "string",
        }
      },
      required: ['name']
    },
    response: {
      success: {
        type: "boolean"
      }
    }
  }

  type postCustomerBody = {
    name: string
  }

  fastify.post<{Body: postCustomerBody}>('/customer',{ schema: customerSchema }, async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const body = request.body;
      await client.query(
        generics.insert(tableName, ['name']),
        [body.name]
      );

      return { success: true };
    } finally {
      client.release();
    }
  })
}

export default customers;
