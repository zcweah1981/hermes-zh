import fs from 'fs';
import path from 'path';

const CONTENT_REPO = '/opt/projects/awesome-hermes-agent-zh';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const mdFiles = getAllFiles(path.join(CONTENT_REPO, 'docs')).filter(f => f.endsWith('.md'));
const brokenLinks: any[] = [];

mdFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(CONTENT_REPO, file);
  
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    let link = match[2].trim();
    if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) continue;

    // Strip < > if present
    if (link.startsWith('<') && link.endsWith('>')) {
      link = link.substring(1, link.length - 1);
    }

    // Decode URL encoding
    try {
      link = decodeURIComponent(link);
    } catch (e) {}

    const cleanLink = link.split(/[?#]/)[0];
    if (!cleanLink) continue;

    const absoluteLinkPath = path.resolve(path.dirname(file), cleanLink);
    const repoRelativeLink = path.relative(CONTENT_REPO, absoluteLinkPath);

    if (!fs.existsSync(absoluteLinkPath)) {
        brokenLinks.push({
            file: relativePath,
            link: match[2],
            resolved: cleanLink,
            repoRelative: repoRelativeLink,
            reason: 'File not found'
        });
    }
  }
});

console.log(JSON.stringify(brokenLinks, null, 2));
