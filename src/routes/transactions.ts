import { FastifyPluginAsync } from 'fastify'
import generics from '../queries/generics'
import { PoolClient } from 'pg';

const tableName = "transactions";


const getTransactionsSchema = {
  query: {
    type: "object",
    properties: {
      source_id: {
        type: "number",
      },
      category_name: {
        type: "string",
      },
      type: {
        type: "string",
      },
    },
  },
  response: {
    success: {
      type: "boolean"
    }
  }
}

type getTransactionQuery = {
  source_id: number;
  category_name: string;
  type: string;
}

const fieldMapping: {[key: string]: any} = {
  category_name: 'cat.name',
  type: 'cat.type',
  source_id: 's.id',
}

const transactionQueryConstructor = (query: getTransactionQuery) => {
  const dbQuery = [
    `
      SELECT t.id transaction_id, cus.name customer_name, s.label source_label, cat.type category_type, cat.name category_name, T.points total_points
      FROM transactions t 
      INNER JOIN customers cus ON t.customer_id = cus.id
      INNER JOIN sources s ON t.source_id = s.id
      INNER JOIN categories cat ON t.category_id = cat.id
    `,
  ];

  Object.entries(query).forEach((q, index) => {
    const [key, val] = q;
    if (index === 0) {
      dbQuery.push('WHERE')
    } else {
      dbQuery.push('AND')
    }

    let _val;
    if (typeof val === 'string') {
      _val = `'${val}'`;
    } else {
      _val = val;
    }

    dbQuery.push(`${fieldMapping[key]} = ${_val}`)
  });

  return dbQuery.join(' ');
}

const transactions: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Querystring: getTransactionQuery }>('/transactions',{ schema: getTransactionsSchema }, async function (request, reply) {
    const query = request.query;
    if ((query.category_name && !query.source_id) ||
      (!query.category_name && query.source_id)) {
      return { success: false, message: 'Invalid query.' }
    }
    const client = await fastify.pg.connect();
    try {
      const dbQuery = transactionQueryConstructor(query);
      
      const { rows } = await client.query(
        dbQuery
      );

      return rows;
    } finally {
      client.release();
    }
  })
  
  const postTransactionSchema = {
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

  const calculateBalance = async (client: PoolClient, customerID: number) => {
    const {rows: earnedRowsSum} = await client.query(
      generics.aggregatePoints('earned'),
      [customerID]
    );
    
    const {rows: spentRowsSum} = await client.query(
      generics.aggregatePoints('spent'),
      [customerID]
    );

    const totalEarned = earnedRowsSum[0] ? earnedRowsSum[0].total_points : 0;
    const totalSpent = spentRowsSum[0] ? spentRowsSum[0].total_points : 0;
    
    return totalEarned - totalSpent;
  }

  fastify.post<{ Body: postTransactionBody }>('/transaction', { schema: postTransactionSchema }, async function (request, reply) {
    const client = await fastify.pg.connect();
    try {
      const body = request.body;

      const { rows: categoryRow } = await client.query(
        'SELECT type FROM categories WHERE id = $1',
        [body.categoryID]
      );

      if (categoryRow[0] && categoryRow[0].type === 'spent') {
        if (await calculateBalance(client, body.customerID) < body.points) {
          return { success: false, message: "No enough balance." }
        }
      }

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
