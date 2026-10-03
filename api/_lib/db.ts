import postgres from 'postgres'

let cliente: postgres.Sql | undefined

export function db(): postgres.Sql {
  if (!cliente) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('Falta la variable de entorno DATABASE_URL')
    // Una conexión por instancia: las funciones serverless no comparten pool.
    // prepare: false para que funcione detrás de poolers en modo transacción.
    cliente = postgres(url, { max: 1, prepare: false, idle_timeout: 20 })
  }
  return cliente
}
