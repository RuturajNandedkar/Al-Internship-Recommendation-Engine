import mongoose from "mongoose";
import dotenv from "dotenv";
import Internship from "../models/Internship";

dotenv.config();

const internships = [
  {
    internshipId: "INT001",
    title: "Frontend Developer Intern",
    company: "TechNova Solutions",
    location: "Remote",
    domain: "Web Development",
    role_complexity: "Intermediate",
    skills_required: ["React", "JavaScript", "CSS", "HTML", "Tailwind CSS"],
    description: "Work on building modern web applications using React and Tailwind CSS.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT002",
    title: "Data Analyst Intern",
    company: "DataMetrics Inc.",
    location: "New York, NY",
    domain: "Data Science",
    role_complexity: "Beginner",
    skills_required: ["Python", "SQL", "Pandas", "Data Visualization"],
    description: "Analyze large datasets and present insights to stakeholders.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT003",
    title: "Cybersecurity Analyst Intern",
    company: "SecureNet Systems",
    location: "Austin, TX",
    domain: "Cybersecurity",
    role_complexity: "Advanced",
    skills_required: ["Networking", "Python", "Linux", "Security Protocols"],
    description: "Help monitor systems for security threats and implement defensive strategies.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT004",
    title: "AI/ML Engineer Intern",
    company: "FutureMind AI",
    location: "Remote",
    domain: "Machine Learning",
    role_complexity: "Advanced",
    skills_required: ["Python", "TensorFlow", "PyTorch", "Calculus", "Statistics"],
    description: "Develop and train machine learning models for real-world applications.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT005",
    title: "Backend Developer Intern",
    company: "CloudCore Systems",
    location: "San Francisco, CA",
    domain: "Cloud",
    role_complexity: "Intermediate",
    skills_required: ["Node.js", "Express", "MongoDB", "Docker"],
    description: "Build scalable backend APIs and manage cloud infrastructure.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT006",
    title: "UI/UX Designer Intern",
    company: "CreativeFlow Design",
    location: "Remote",
    domain: "UI/UX Design",
    role_complexity: "Beginner",
    skills_required: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    description: "Collaborate with developers to create user-friendly application interfaces.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT007",
    title: "Mobile App Developer Intern",
    company: "AppSphere Ventures",
    location: "Seattle, WA",
    domain: "Mobile Development",
    role_complexity: "Intermediate",
    skills_required: ["React Native", "JavaScript", "Mobile Design", "APIs"],
    description: "Build and deploy mobile applications for both iOS and Android.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT008",
    title: "DevOps Engineer Intern",
    company: "SysOps Global",
    location: "Chicago, IL",
    domain: "DevOps",
    role_complexity: "Advanced",
    skills_required: ["Cloud", "Jenkins", "Kubernetes", "Linux", "Ansible"],
    description: "Streamline deployment pipelines and manage server configurations.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT009",
    title: "Software Engineer Intern",
    company: "BuildBetter Corp",
    location: "Boston, MA",
    domain: "Web Development",
    role_complexity: "Beginner",
    skills_required: ["Java", "Spring Boot", "SQL", "Unit Testing"],
    description: "Assist in developing enterprise software solutions using Java.",
    posted_date: new Date(),
  },
  {
    internshipId: "INT010",
    title: "Blockchain Developer Intern",
    company: "ChainLabs",
    location: "Remote",
    domain: "Blockchain",
    role_complexity: "Advanced",
    skills_required: ["Solidity", "Ethereum", "Cryptography", "Python"],
    description: "Build smart contracts and decentralized applications on the blockchain.",
    posted_date: new Date(),
  },
];

const seedData = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not defined for seeding");
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Internship.deleteMany({});
    console.log("Cleared existing internships.");

    // Insert new data
    await Internship.insertMany(internships);
    console.log(`Successfully seeded ${internships.length} internships.`);

    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding data:", error.message);
    process.exit(1);
  }
};

seedData();
