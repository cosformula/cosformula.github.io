import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const blogDir = './src/data/blog';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

async function processFiles() {
  const files = getAllFiles(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    try {
        const parsed = matter(content);
        const data = parsed.data;
        let changed = false;

        // 1. Rename date -> pubDatetime
        if (data.date) {
            data.pubDatetime = data.date;
            delete data.date;
            changed = true;
        }

        // 2. Rename updated -> modDatetime
        if (data.updated) {
            data.modDatetime = data.updated;
            delete data.updated;
            changed = true;
        }

        // 3. Rename summary -> description
        if (data.summary) {
            data.description = data.summary;
            delete data.summary;
            changed = true;
        } else if (!data.description) {
            // Fallback if no description
            data.description = data.title;
            changed = true;
        }

        if (changed) {
            const newContent = matter.stringify(parsed.content, data);
            fs.writeFileSync(filePath, newContent);
            console.log(`Processed ${filePath}`);
        }
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
    }
  }
}

processFiles();
