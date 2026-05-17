import { createSeoPlatformClients, loadSeoPlatformSecrets, redactSeoSecrets } from '../lib/seo/platform-clients'

async function main() {
  const secrets = loadSeoPlatformSecrets()
  const clients = createSeoPlatformClients(secrets)
  const results = []

  results.push(await clients.gsc.readSites())
  results.push(await clients.bing.readSite('https://hermes-zh.com'))
  results.push(await clients.baidu.pushUrls(['https://hermes-zh.com/']))
  results.push(await clients.indexNow.checkKeyLocation())

  console.log(redactSeoSecrets(JSON.stringify({ sourcePath: secrets.sourcePath, results }, null, 2)))

  const hardFailure = results.find((result) => result.status === 'error')
  if (hardFailure) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(redactSeoSecrets(String(error instanceof Error ? error.stack || error.message : error)))
  process.exitCode = 1
})
