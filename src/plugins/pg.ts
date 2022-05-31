import fp from 'fastify-plugin'
import fastifyPostgres, {PostgresPluginOptions} from '@fastify/postgres'

/**
 * This plugins adds postgres utility
 *
 */
export default fp<PostgresPluginOptions>(async (fastify) => {
  fastify.register(fastifyPostgres, {
    connectionString: 'postgres://postgres:123@localhost/postgres'
  })
})
