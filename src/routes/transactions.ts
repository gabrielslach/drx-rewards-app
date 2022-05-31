import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'

const tableName = "transactions";
const transactions: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/transactions', async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const { rows } = await client.query(
        `
          SELECT t.id transaction_id, cus.name customer_name, s.source_label source_label, cat.type category_type, cat.name category_name
          FROM transactions t 
          INNER JOIN customer cus ON t.customer_id = cus.id
          INNER JOIN sources s ON t.source_id = s.id
          INNER JOIN category cat ON t.category_id = cat.id
        `
      );

      return rows;
    } finally {
      client.release();
    }
  })

  fastify.post('/transaction', async function (request, reply) {
    const bodyStr = request.body as string;
    const client = await fastify.pg.connect();
    try {
      const body: {sourceID: number, categoryID: number, customerID: number, points: number} = JSON.parse(bodyStr);
      await client.query(
        generics.insert(tableName, ['source_id', 'category_id', 'customer_id', 'points']),
        [body.sourceID, body.categoryID, body.customerID, body.points]
      );

      return true;
    } finally {
      client.release();
    }
  })
}

export default transactions;
