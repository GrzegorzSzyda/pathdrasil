import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { defineConfig, type Plugin } from 'vite'

const execFileAsync = promisify(execFile)

const localCliAccounts = (): Plugin => ({
  name: 'local-cli-accounts',
  configureServer(server) {
    server.middlewares.use(
      '/api/integrations/accounts',
      async (_request, response) => {
        const readAccount = async (command: string, provider: string) => {
          try {
            const { stdout, stderr } = await execFileAsync(command, [
              'auth',
              'status',
            ])
            const output = `${stdout}\n${stderr}`
            const match = output.match(/account\s+([^\s(]+)|as\s+([^\s(]+)/i)
            const name = match?.[1] ?? match?.[2]
            return name
              ? [
                  {
                    id: `${provider}:${name}`,
                    name,
                    description: `${provider} · lokalny profil CLI`,
                  },
                ]
              : []
          } catch {
            return []
          }
        }
        const [github, gitlab] = await Promise.all([
          readAccount('gh', 'GitHub'),
          readAccount('glab', 'GitLab'),
        ])
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({ 'github-issues': github, 'gitlab-issues': gitlab }),
        )
      },
    )
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), localCliAccounts()],
  server: {
    // Umożliwia dostęp z przeglądarki uruchomionej po stronie Windows/WSL.
    host: true,
  },
})
