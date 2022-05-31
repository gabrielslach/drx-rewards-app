import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'

const tableName = "transactions";
const transactions: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/transactions', async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const { rows } = await client.query(
        `
          SELECT t.id transactionID, cus.name customerName, s.label sourceLabel, cat.type categoryType, cat.name categoryName, T.points totalPoints
          FROM transactions t 
          INNER JOIN customers cus ON t.customer_id = cus.id
          INNER JOIN sources s ON t.source_id = s.id
          INNER JOIN categories cat ON t.category_id = cat.id
        `
      );

      return rows;
    } finally {
      client.release();
    }
  })
  
  const transactionSchema = {
    body: {
      type: "object",
      properties: {
        sourceID: {
          type: "number",
        },
        categoryID: {
          type: "number",
        },
        customerID: {
          type: "number",
        },
        points: {
          type: "number",
        },
      },
      required: ['sourceID', 'categoryID', 'customerID', 'points']
    },
    response: {
      success: {
        type: "boolean"
      }
    }
  }

  type postTransactionBody = {
    sourceID: number;
    categoryID: number;
    customerID: number;
    points: number;
  }

  fastify.post<{ Body: postTransactionBody }>('/transaction', { schema: transactionSchema }, async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const body = request.body;
      await client.query(
        generics.insert(tableName, ['source_id', 'category_id', 'customer_id', 'points']),
        [body.sourceID, body.categoryID, body.customerID, body.points]
      );

      return { success: true };
    } finally {
      client.release();
    }
  })
}

export default transactions;
