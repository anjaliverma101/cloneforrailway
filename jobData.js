// Job data generator - deterministically generates 100,000 jobs for Dubai/UAE
const TOTAL_JOBS = 100000;

const jobTitles = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Analyst", "Data Scientist", "Machine Learning Engineer", "DevOps Engineer",
  "Cloud Architect", "Mobile Developer", "Android Developer", "iOS Developer",
  "Product Manager", "Project Manager", "Scrum Master", "Business Analyst",
  "UI/UX Designer", "Graphic Designer", "Brand Designer", "Web Designer",
  "Marketing Manager", "Digital Marketing Specialist", "SEO Specialist", "Content Writer",
  "Copywriter", "Social Media Manager", "Community Manager", "Growth Hacker",
  "Sales Manager", "Account Manager", "Business Development Manager", "Sales Executive",
  "Financial Analyst", "Accountant", "Finance Manager", "Auditor",
  "HR Manager", "HR Generalist", "Recruiter", "Talent Acquisition Specialist",
  "Operations Manager", "Supply Chain Manager", "Logistics Coordinator", "Procurement Officer",
  "Customer Success Manager", "Customer Support Specialist", "Technical Support Engineer",
  "Network Engineer", "Cybersecurity Analyst", "Information Security Officer",
  "Database Administrator", "Systems Administrator", "IT Manager", "CTO",
  "Legal Counsel", "Compliance Officer", "Risk Manager", "Contract Manager",
  "Healthcare Administrator", "Clinical Research Associate", "Pharmacist", "Nurse",
  "Teacher", "Education Consultant", "Instructional Designer", "Training Manager",
  "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Structural Engineer",
  "Architect", "Urban Planner", "Environmental Consultant", "Safety Officer",
  "Real Estate Agent", "Property Manager", "Facilities Manager", "Construction Manager",
  "Research Analyst", "Policy Analyst", "Communications Manager", "Public Relations Officer",
  "Executive Assistant", "Administrative Officer", "Office Manager", "Receptionist",
  "Video Editor", "Motion Graphics Designer", "Content Strategist", "Brand Manager",
  "Partnerships Manager", "Customer Experience Manager", "Data Engineer", "BI Developer",
  "Scrum Master", "Agile Coach", "Release Manager", "Site Reliability Engineer",
  "Penetration Tester", "Cloud Engineer", "Platform Engineer", "API Developer",
  "Hotel Manager", "Restaurant Manager", "Chef", "Sommelier", "Event Manager",
  "Aviation Engineer", "Pilot", "Flight Attendant", "Airport Manager"
];

// 75+ Dubai/UAE based companies + global companies with UAE presence
const companies = [
  // UAE/Dubai based
  "Emirates Group", "Dubai Holding", "Emaar Properties", "DP World", "Dubai World",
  "Abu Dhabi National Oil Company (ADNOC)", "Etihad Airways", "Flydubai", "Air Arabia",
  "Al Habtoor Group", "Al Futtaim Group", "Dubai Islamic Bank", "Emirates NBD",
  "Abu Dhabi Commercial Bank", "First Abu Dhabi Bank", "Mashreq Bank", "RAK Bank",
  "Dubai Investments", "DAMAC Properties", "Nakheel", "Meraas", "Al Tayer Group",
  "Jumeirah Group", "Atlantis The Palm", "Burj Al Arab", "Emirates Airlines",
  
  // Global with UAE presence
  "Google", "Amazon", "Microsoft", "Apple", "Meta", "Tesla", "Netflix",
  "IBM", "Oracle", "Cisco", "Dell", "HP", "SAP", "Salesforce",
  "Accenture", "Deloitte", "PwC", "KPMG", "EY", "McKinsey", "Boston Consulting Group",
  "HSBC", "Standard Chartered", "Citi", "JPMorgan Chase", "Goldman Sachs",
  "Unilever", "P&G", "Nestle", "Coca-Cola", "PepsiCo",
  "Shell", "BP", "TotalEnergies", "ExxonMobil", "Chevron",
  "Siemens", "GE", "Schneider Electric", "ABB", "Honeywell",
  "Boeing", "Airbus", "Rolls-Royce", "Lockheed Martin",
  "Pfizer", "Novartis", "Roche", "GSK", "Johnson & Johnson",
  "Samsung", "LG", "Sony", "Panasonic", "Toshiba",
  "Toyota", "Honda", "Nissan", "BMW", "Mercedes-Benz",
  "LVMH", "Kering", "Chanel", "Gucci", "Rolex"
];

const dubaiLocations = [
  // Dubai
  "Downtown Dubai, Dubai", "Dubai Marina, Dubai", "Jumeirah, Dubai", "Business Bay, Dubai",
  "Dubai Silicon Oasis, Dubai", "Dubai Internet City, Dubai", "Media City, Dubai",
  "JLT (Jumeirah Lakes Towers), Dubai", "DIFC (Dubai International Financial Centre), Dubai",
  "Al Barsha, Dubai", "Deira, Dubai", "Bur Dubai, Dubai", "Karama, Dubai",
  "Al Satwa, Dubai", "Jebel Ali, Dubai", "Dubai South, Dubai", "Al Quoz, Dubai",
  "Emirates Hills, Dubai", "Palm Jumeirah, Dubai", "The World Islands, Dubai",
  "Al Wasl, Dubai", "Al Nahda, Dubai", "Mirdif, Dubai", "Al Warqa, Dubai",
  "Al Garhoud, Dubai", "Oud Metha, Dubai", "Al Rigga, Dubai", "Al Raffa, Dubai",
  
  // Abu Dhabi
  "Abu Dhabi City, Abu Dhabi", "Al Reem Island, Abu Dhabi", "Yas Island, Abu Dhabi",
  "Al Raha Beach, Abu Dhabi", "Khalifa City, Abu Dhabi", "Al Ain, Abu Dhabi",
  "Saadiyat Island, Abu Dhabi", "Corniche, Abu Dhabi", "Al Maryah Island, Abu Dhabi",
  "Mohamed Bin Zayed City, Abu Dhabi", "Mussafah, Abu Dhabi",
  
  // Sharjah
  "Sharjah City, Sharjah", "Al Majaz, Sharjah", "Al Khan, Sharjah", "Al Nahda, Sharjah",
  "Muwaileh, Sharjah", "Al Tai, Sharjah",
  
  // Other Emirates
  "Ajman City, Ajman", "Ras Al Khaimah, RAK", "Fujairah City, Fujairah",
  "Umm Al Quwain, UAQ", "Al Jazirah, UAQ",
  
  // Remote
  "Remote — UAE", "Remote — Dubai, UAE"
];

const salaryRanges = [
  { display: "AED 5,000 – 8,000/month", min: 5000, max: 8000 },
  { display: "AED 8,000 – 12,000/month", min: 8000, max: 12000 },
  { display: "AED 12,000 – 18,000/month", min: 12000, max: 18000 },
  { display: "AED 18,000 – 25,000/month", min: 18000, max: 25000 },
  { display: "AED 25,000 – 35,000/month", min: 25000, max: 35000 },
  { display: "AED 35,000 – 50,000/month", min: 35000, max: 50000 },
  { display: "AED 50,000 – 75,000/month", min: 50000, max: 75000 },
  { display: "AED 75,000 – 100,000/month", min: 75000, max: 100000 },
  { display: "AED 100,000+/month", min: 100000, max: 150000 },
  { display: "AED 3,000 – 5,000/month", min: 3000, max: 5000 }
];

const jobTypes = ["FULL_TIME", "CONTRACTOR", "PART_TIME", "INTERN", "TEMPORARY"];
const jobTypeDisplay = { 
  "FULL_TIME": "Full-time", 
  "CONTRACTOR": "Contract", 
  "PART_TIME": "Part-time", 
  "INTERN": "Internship", 
  "TEMPORARY": "Temporary" 
};

const experienceLevels = [
  { display: "Entry Level", schema: "no requirements" },
  { display: "Mid Level",   schema: "2 years experience" },
  { display: "Senior Level",schema: "5 years experience" },
  { display: "Lead",        schema: "7 years experience" },
  { display: "Manager",     schema: "5 years experience" },
  { display: "Director",    schema: "8 years experience" },
  { display: "Executive",   schema: "10 years experience" }
];

const industries = [
  "Technology", "Fintech", "E-commerce", "Banking & Finance", "Oil & Gas",
  "Real Estate", "Healthcare", "Education", "Consulting", "Aviation",
  "Construction", "Logistics & Shipping", "Hospitality", "Retail", "Media & Entertainment",
  "Renewable Energy", "Automotive", "Telecommunications", "Legal", "Government"
];

const jobDescriptions = [
  (title, company, isRemote, location) => `We are seeking a talented ${title} to join the team at ${company} in Dubai. ${isRemote ? "This is a fully remote role open to qualified candidates across the UAE." : `This role is based in ${location}.`}

You will be responsible for delivering high-quality work that drives business outcomes and contributes to ${company}'s growing operations in the UAE and Middle East region.

Key Responsibilities:
• Lead and execute core ${title.toLowerCase()} functions across the organization
• Collaborate with cross-functional teams to deliver on strategic objectives
• Analyze data and provide actionable insights to improve performance
• Mentor junior team members and contribute to knowledge sharing
• Ensure best practices are followed in all deliverables

Requirements:
• 3–5 years of experience in a similar ${title.toLowerCase()} role
• Strong communication and problem-solving skills
• Experience working in fast-paced global tech/business environment
• Bachelor's degree in a relevant field
• Proficiency with modern tools and platforms

What We Offer:
• Competitive salary in AED
• Health insurance for you and family
• 30 days annual leave
• Remote work allowance
• Annual performance bonus
• Professional development budget
• Tax-free income in Dubai`,

  (title, company, isRemote, location) => `${company} is hiring a ${title}! We are a leading company in Dubai looking for experienced professionals to scale our impact across the UAE and Middle East.

${isRemote ? "This remote-first position allows you to work from anywhere in the UAE with flexible hours." : `You will work from our ${location} office with a dynamic, ambitious team.`}

About the Role:
As a ${title} at ${company}, you will play a key role in shaping our products and services. You'll work closely with leadership and peers to execute on our mission in one of the world's fastest-growing economies.

What You'll Do:
• Drive key ${title.toLowerCase()} initiatives from planning to execution
• Build and maintain relationships with key stakeholders
• Report on KPIs and contribute to strategic planning
• Stay updated on industry trends globally and in the UAE
• Represent ${company} with professionalism and integrity

What You Bring:
• 2–6 years proven experience as a ${title.toLowerCase()}
• Strong analytical and communication skills
• Team player with a growth mindset
• Relevant certification or degree preferred

Compensation & Benefits:
• Competitive AED salary • Tax-free income • Health insurance • Annual leave (30 days) • Education allowance • Housing allowance (for eligible positions)`,

  (title, company, isRemote, location) => `Join ${company} as a ${title} and be part of one of Dubai's most exciting companies!

${isRemote ? "🌐 Remote | Work from anywhere in the UAE" : `📍 ${location}`}

We're building the future of business in the Middle East and need exceptional talent like you. This is a rare opportunity to work with a world-class brand while enjoying the tax-free lifestyle of Dubai.

The Opportunity:
You'll be taking on the ${title} role at a critical growth stage. Your work will directly impact millions of customers across the region.

Day-to-Day Responsibilities:
• Execute and improve key workflows within the ${title.toLowerCase()} function
• Collaborate with product, engineering, and business teams
• Track metrics and optimize for performance
• Contribute to a culture of excellence and innovation
• Support senior leadership with reporting and strategy

Your Profile:
• 3+ years in ${title.toLowerCase()} or related field
• Comfortable in a fast-moving global business ecosystem
• Strong interpersonal skills and professional work ethic
• Degree in relevant discipline (Master's is a plus)

Perks at ${company}:
Tax-free salary | Health insurance | Housing allowance (optional) | Annual flight allowance | Education allowance | 30 days leave | Performance bonus | Learning budget | Gym membership`
];

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getJobData(id) {
  const seed = id * 7919;
  const r = (offset = 0) => seededRandom(seed + offset);

  const isRemote = id <= TOTAL_JOBS / 2;

  const companyIndex = Math.floor((id - 1) / Math.ceil(TOTAL_JOBS / companies.length)) % companies.length;

  const titleIndex   = Math.floor(r(1) * jobTitles.length);
  const locationIndex= Math.floor(r(3) * dubaiLocations.length);
  const salaryIndex  = Math.floor(r(4) * salaryRanges.length);
  const jobTypeIndex = Math.floor(r(5) * jobTypes.length);
  const expIndex     = Math.floor(r(6) * experienceLevels.length);
  const industryIndex= Math.floor(r(7) * industries.length);
  const descIndex    = Math.floor(r(8) * jobDescriptions.length);

  const title    = jobTitles[titleIndex];
  const company  = companies[companyIndex];
  const location = isRemote ? "Remote — UAE" : dubaiLocations[locationIndex];
  const salary   = salaryRanges[salaryIndex];
  const jobType  = jobTypes[jobTypeIndex];
  const exp      = experienceLevels[expIndex];
  const industry = industries[industryIndex];
  const description = jobDescriptions[descIndex](title, company, isRemote, dubaiLocations[locationIndex]);

  const daysAgo = Math.floor(r(9) * 60);
  const postedDate = new Date();
  postedDate.setDate(postedDate.getDate() - daysAgo);
  const validThrough = new Date(postedDate);
  validThrough.setDate(validThrough.getDate() + 90);

  return {
    id,
    title,
    company,
    location,
    salary: salary.display,
    salaryMin: salary.min,
    salaryMax: salary.max,
    jobType,
    jobTypeDisplay: jobTypeDisplay[jobType],
    experience: exp.display,
    experienceSchema: exp.schema,
    industry,
    isRemote,
    description,
    postedDate: postedDate.toISOString().split('T')[0],
    validThrough: validThrough.toISOString().split('T')[0],
    slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`
  };
}

function getJobSchema(job) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company,
      "value": `JOB-AE-${String(job.id).padStart(6, '0')}`
    },
    "datePosted": job.postedDate,
    "validThrough": `${job.validThrough}T00:00:00Z`,
    "employmentType": job.jobType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "sameAs": `https://www.google.com/search?q=${encodeURIComponent(job.company)}`
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.isRemote ? "Dubai" : job.location.split(',')[0],
        "addressCountry": "AE"
      }
    },
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "United Arab Emirates"
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "AED",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salaryMin,
        "maxValue": job.salaryMax,
        "unitText": "MONTH"
      }
    },
    "experienceRequirements": {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": job.experienceSchema === "no requirements" ? 0
        : parseInt(job.experienceSchema) * 12
    },
    "industry": job.industry,
    "url": `/jobs/${job.id}`,
    "directApply": true
  };

  if (job.isRemote) {
    schema.jobLocationType = "TELECOMMUTE";
  }

  return schema;
}

module.exports = { getJobData, getJobSchema, TOTAL_JOBS, jobTitles, companies, dubaiLocations, industries };