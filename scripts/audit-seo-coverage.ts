
import { promises as fs } from 'node:fs';
// @ts-ignore
import yaml from 'js-yaml';

async function audit() {
  const routeMapPath = '/opt/projects/awesome-hermes-agent-zh/governance/site-route-map.yaml';
  const metadataPath = '/opt/projects/hermes-zh/lib/seo/metadata.ts';
  const llmsTxtPath = '/opt/projects/hermes-zh/app/llms.txt/route.ts';
  
  const routeMap = yaml.load(await fs.readFile(routeMapPath, 'utf8')) as { routes: any[] };
  const metadataContent = await fs.readFile(metadataPath, 'utf8');
  const llmsTxtContent = await fs.readFile(llmsTxtPath, 'utf8');
  
  const publishedRoutes = routeMap.routes.filter((r: any) => r.status === 'published');
  
  console.log('--- Coverage Audit ---');
  for (const route of publishedRoutes) {
    const slug = route.slug.startsWith('/') ? route.slug : `/${route.slug}`;
    const docPath = slug.startsWith('/docs') ? slug : `/docs${slug}`;
    
    const inMetadata = metadataContent.includes(`'${docPath}':`) || metadataContent.includes(`'${slug}':`);
    const inLlmsTxt = llmsTxtContent.includes(docPath) || llmsTxtContent.includes(slug);
    
    if (route.page_type === 'module-overview') {
       if (!inMetadata || !inLlmsTxt) {
         console.log(`[MISSING] ${docPath} (Type: ${route.page_type}) - Metadata: ${inMetadata}, llms.txt: ${inLlmsTxt}`);
       }
    }
  }
}

audit().catch(console.error);
