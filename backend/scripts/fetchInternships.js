/**
 * Script to fetch internships from Adzuna API and store them in MongoDB.
 * Run with: node backend/scripts/fetchInternships.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Define Internship Schema (simple version to avoid TypeScript imports)
const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  domain: { type: String, required: true },
  required_skills: { type: [String], default: [] },
  stipend: { type: String, default: 'Not specified' },
  duration: { type: String, default: 'Not specified' },
  application_link: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  postedDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Internship = mongoose.model('Internship', internshipSchema);

async function fetchAdzunaInternships() {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;
  const keyword = 'internship';
  const country = 'in'; // Search in India by default

  if (!appId || !apiKey) {
    console.error('❌ Error: ADZUNA_APP_ID or ADZUNA_API_KEY is missing in .env');
    return;
  }

  console.log(`🔍 Fetching internships from Adzuna API for keyword: "${keyword}"...`);
  
  // Use built-in fetch (Node 18+) or a polyfill if needed.
  // For safety in various Node versions, we'll check if fetch is available.
  if (typeof fetch === 'undefined') {
    console.error('❌ Error: Global fetch is not available. Please use Node.js 18 or higher.');
    return;
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${apiKey}&what=${keyword}&content-type=application/json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    console.log(`✅ Adzuna API returned ${results.length} jobs.`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const job of results) {
      try {
        // Deduplication: Check if an internship with the same application link already exists
        const existingInternship = await Internship.findOne({ application_link: job.redirect_url });

        if (existingInternship) {
          skippedCount++;
          continue;
        }

        // Map Adzuna job to Internship model
        const title = job.title || 'Untitled Internship';
        const description = job.description || 'No description provided.';
        
        // Simple domain inference based on title/description
        let domain = 'Other';
        const content = (title + ' ' + description).toLowerCase();
        
        if (content.includes('web') || content.includes('frontend') || content.includes('backend') || content.includes('react')) domain = 'Web Development';
        else if (content.includes('ai') || content.includes('machine learning') || content.includes('intelligence')) domain = 'AI';
        else if (content.includes('data') || content.includes('analytics') || content.includes('science')) domain = 'Data Science';
        else if (content.includes('cyber') || content.includes('security')) domain = 'Cybersecurity';
        else if (content.includes('cloud') || content.includes('aws') || content.includes('azure')) domain = 'Cloud';
        else if (content.includes('mobile') || content.includes('android') || content.includes('ios')) domain = 'Mobile Development';
        else if (content.includes('ui') || content.includes('ux') || content.includes('design')) domain = 'UI/UX Design';
        else if (content.includes('devops') || content.includes('docker') || content.includes('kubernetes')) domain = 'DevOps';

        const newInternship = new Internship({
          title: title,
          company: (job.company && job.company.display_name) || 'Anonymous Company',
          location: (job.location && job.location.display_name) || 'Remote / Multiple Locations',
          domain: domain,
          required_skills: job.category ? [job.category.label] : ['Internship'],
          stipend: job.salary_min ? `${job.salary_min} ${job.salary_max ? '- ' + job.salary_max : ''}` : 'Competitive / Not specified',
          duration: 'Not specified',
          application_link: job.redirect_url,
          description: description,
          postedDate: job.created ? new Date(job.created) : new Date()
        });

        await newInternship.save();
        insertedCount++;
        console.log(`✨ Added: ${title} @ ${(job.company && job.company.display_name) || 'Anonymous'}`);
      } catch (err) {
        console.error(`⚠️ Failed to process job ${job.id}: ${err.message}`);
      }
    }

    console.log(`\n📊 Fetch Summary:`);
    console.log(`- Total Results: ${results.length}`);
    console.log(`- New Internships Added: ${insertedCount}`);
    console.log(`- Duplicates Skipped: ${skippedCount}`);

  } catch (error) {
    console.error(`❌ Fetch Error: ${error.message}`);
  }
}

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    await fetchAdzunaInternships();
    
    console.log('🏁 Finished fetching internships.');
  } catch (err) {
    console.error(`❌ Database connection error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

start();
