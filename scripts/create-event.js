#!/usr/bin/env node

/**
 * Create Photography Event Script
 *
 * Uploads photos to Cloudflare R2, creates thumbnails, and generates/updates markdown event page
 *
 * Usage:
 *   node scripts/create-event.js --name "Event Name" --dir ./photos --folder_name event-folder
 */

require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const matter = require('gray-matter');
const readline = require('readline');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Event name',
    demandOption: true
  })
  .option('dir', {
    alias: 'd',
    type: 'string',
    description: 'Local directory with photos',
    demandOption: true
  })
  .option('folder_name', {
    alias: 'f',
    type: 'string',
    description: 'Remote folder name in R2',
    demandOption: true
  })
  .option('date', {
    type: 'string',
    description: 'Event date (YYYY-MM-DD)',
    default: new Date().toISOString().split('T')[0]
  })
  .help()
  .argv;

// Cloudflare R2 configuration (S3-compatible)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.R2_SECRET_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'photos';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://photos.aurbano.eu';

// Validate environment variables
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
  console.error('Error: Missing R2 credentials in environment variables');
  console.error('Required: R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY');
  process.exit(1);
}

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY
  }
});

// Helper to prompt user for confirmation
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

// Check if file exists in R2
async function fileExistsInR2(key) {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: key
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Upload file to R2
async function uploadToR2(filePath, key) {
  const fileContent = await fs.readFile(filePath);

  await s3Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: getContentType(filePath)
  }));
}

// Get content type based on file extension
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return types[ext] || 'application/octet-stream';
}

// Create thumbnail
async function createThumbnail(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(outputPath);
}

// Get file size in KB
async function getFileSizeKB(filePath) {
  const stats = await fs.stat(filePath);
  return Math.round(stats.size / 1024);
}

// Parse existing markdown to preserve featured flags
async function parseExistingEvent(eventSlug) {
  const markdownPath = path.join(__dirname, '../content/photography', `${eventSlug}.md`);

  try {
    const content = await fs.readFile(markdownPath, 'utf-8');
    const parsed = matter(content);

    // Create a map of existing photos with their featured status
    const existingPhotos = new Map();
    if (parsed.data.photos && Array.isArray(parsed.data.photos)) {
      parsed.data.photos.forEach(photo => {
        const filename = photo.url.split('/').pop();
        existingPhotos.set(filename, {
          featured: photo.featured || false,
          span: photo.span || 1
        });
      });
    }

    return {
      exists: true,
      content: parsed.content,
      existingPhotos
    };
  } catch (error) {
    return {
      exists: false,
      content: '',
      existingPhotos: new Map()
    };
  }
}

// Generate markdown content
function generateMarkdown(name, date, photos, description) {
  const photoList = photos.map(p =>
    `  - url: "${p.url}"\n    featured: ${p.featured}\n    span: ${p.span}`
  ).join('\n');

  return `---
title: "${name}"
date: ${date}
photos:
${photoList}
---

${description}
`;
}

// Create slug from event name
function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Main execution
async function main() {
  console.log('🎨 Photography Event Creator\n');
  console.log(`Event: ${argv.name}`);
  console.log(`Local directory: ${argv.dir}`);
  console.log(`R2 folder: ${argv.folder_name}`);
  console.log(`Date: ${argv.date}\n`);

  // Check if directory exists
  try {
    await fs.access(argv.dir);
  } catch (error) {
    console.error(`Error: Directory ${argv.dir} does not exist`);
    process.exit(1);
  }

  // Get list of image files
  const files = await fs.readdir(argv.dir);
  const imageFiles = files.filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  if (imageFiles.length === 0) {
    console.error('Error: No image files found in directory');
    process.exit(1);
  }

  console.log(`Found ${imageFiles.length} photos`);

  // Confirm before proceeding
  const answer = await askQuestion(`\nProceed with upload? (y/n): `);
  if (answer.toLowerCase() !== 'y') {
    console.log('Aborted');
    process.exit(0);
  }

  // Create temp directory for thumbnails
  const tempDir = path.join(__dirname, '../.temp-thumbnails');
  await fs.mkdir(tempDir, { recursive: true });

  // Parse existing event if it exists
  const eventSlug = createSlug(argv.name);
  const existing = await parseExistingEvent(eventSlug);

  if (existing.exists) {
    console.log('\n✓ Found existing event - will preserve featured flags');
  }

  const photos = [];
  let uploadedCount = 0;
  let skippedCount = 0;

  console.log('\n📤 Processing and uploading photos...\n');

  for (const [index, filename] of imageFiles.entries()) {
    const filePath = path.join(argv.dir, filename);
    const r2Key = `${argv.folder_name}/${filename}`;
    const thumbKey = `${argv.folder_name}/${path.parse(filename).name}__thumb${path.extname(filename)}`;

    console.log(`[${index + 1}/${imageFiles.length}] ${filename}`);

    // Upload original
    const originalExists = await fileExistsInR2(r2Key);
    if (!originalExists) {
      await uploadToR2(filePath, r2Key);
      uploadedCount++;
      console.log('  ✓ Uploaded original');
    } else {
      skippedCount++;
      console.log('  ⊘ Original already exists');
    }

    // Create and upload thumbnail
    const thumbExists = await fileExistsInR2(thumbKey);
    if (!thumbExists) {
      const thumbPath = path.join(tempDir, `${path.parse(filename).name}__thumb${path.extname(filename)}`);
      await createThumbnail(filePath, thumbPath);
      const thumbSize = await getFileSizeKB(thumbPath);
      await uploadToR2(thumbPath, thumbKey);
      console.log(`  ✓ Created and uploaded thumbnail (${thumbSize}KB)`);
      await fs.unlink(thumbPath);
    } else {
      console.log('  ⊘ Thumbnail already exists');
    }

    // Preserve featured status if photo exists, otherwise default to false
    const existingPhoto = existing.existingPhotos.get(filename);
    photos.push({
      url: `${R2_PUBLIC_URL}/${argv.folder_name}/${filename}`,
      featured: existingPhoto ? existingPhoto.featured : (index < 3), // Default first 3 as featured
      span: existingPhoto ? existingPhoto.span : (index === 0 ? 2 : 1)
    });
  }

  // Cleanup temp directory
  await fs.rmdir(tempDir, { recursive: true });

  console.log(`\n✅ Upload complete: ${uploadedCount} uploaded, ${skippedCount} skipped\n`);

  // Generate/update markdown
  const markdownPath = path.join(__dirname, '../content/photography', `${eventSlug}.md`);
  const description = existing.content || `Photos from ${argv.name}.`;
  const markdown = generateMarkdown(argv.name, argv.date, photos, description);

  await fs.writeFile(markdownPath, markdown, 'utf-8');

  if (existing.exists) {
    console.log(`✓ Updated event: ${markdownPath}`);
  } else {
    console.log(`✓ Created event: ${markdownPath}`);
  }

  console.log(`\n🎉 Done! Event "${argv.name}" is ready.`);
  console.log(`\nNext steps:`);
  console.log(`1. Edit ${markdownPath} to update description`);
  console.log(`2. Adjust featured flags and span values as needed`);
  console.log(`3. Run 'hugo build' to rebuild the site\n`);
}

// Run the script
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
