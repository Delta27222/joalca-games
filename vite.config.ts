import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// En producción Vercel sirve api/*.ts como funciones. En desarrollo, este
// plugin hace lo mismo dentro de `npm run dev`, sin la CLI de Vercel.
function apiEnDesarrollo(): Plugin {
  return {
    name: 'api-en-desarrollo',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const ruta = /^\/api\/([a-z-]+)$/.exec(url.pathname)
        if (!ruta) return next()

        try {
          const modulo = await server.ssrLoadModule(`/api/${ruta[1]}.ts`)
          const handler = modulo[req.method ?? 'GET']
          if (typeof handler !== 'function') {
            res.statusCode = 405
            return res.end()
          }

          const partes: Buffer[] = []
          for await (const parte of req) partes.push(parte as Buffer)
          const cuerpo = partes.length > 0 ? Buffer.concat(partes) : undefined

          const request = new Request(url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : cuerpo,
          })
          const response: Response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((valor, clave) => res.setHeader(clave, valor))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Expone DATABASE_URL (de .env.local) a las funciones de api/ en desarrollo.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), apiEnDesarrollo()],
    server: { host: true },
  }
})
