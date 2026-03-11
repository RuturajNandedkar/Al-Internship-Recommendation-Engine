export default function LearningResources({ results, userSkills }) {
  if (!results || results.length === 0) return null;

  // Gather skills the user is missing from recommended internships
  const userSkillsNorm = (userSkills || []).map((s) => s.toLowerCase().trim());
  const gapSkills = new Set();

  results.forEach((r) => {
    (r.skills || []).forEach((skill) => {
      const lower = skill.toLowerCase().trim();
      const isMatched = userSkillsNorm.some((us) => lower.includes(us) || us.includes(lower));
      if (!isMatched) gapSkills.add(skill);
    });
  });

  // Map skills to learning resources (curated knowledge base)
  const resourceDatabase = {
    python: {
      title: "Python for Beginners",
      platform: "freeCodeCamp",
      type: "Course",
      duration: "4-6 weeks",
      icon: "🐍",
      description: "Learn Python fundamentals including data types, functions, OOP, and libraries.",
    },
    javascript: {
      title: "Modern JavaScript",
      platform: "MDN Web Docs",
      type: "Documentation",
      duration: "3-4 weeks",
      icon: "⚡",
      description: "Master ES6+, async programming, DOM manipulation, and modern JS patterns.",
    },
    react: {
      title: "React - The Complete Guide",
      platform: "React.dev",
      type: "Tutorial",
      duration: "4-6 weeks",
      icon: "⚛️",
      description: "Build modern UIs with components, hooks, state management, and routing.",
    },
    "web development": {
      title: "Full Stack Web Development",
      platform: "The Odin Project",
      type: "Course",
      duration: "8-12 weeks",
      icon: "🌐",
      description: "HTML, CSS, JavaScript, Node.js, databases, and deployment fundamentals.",
    },
    "data analysis": {
      title: "Data Analysis with Python",
      platform: "Kaggle Learn",
      type: "Course",
      duration: "3-4 weeks",
      icon: "📊",
      description: "Pandas, NumPy, data visualization, and exploratory data analysis.",
    },
    "machine learning": {
      title: "Machine Learning Foundations",
      platform: "Google ML Crash Course",
      type: "Course",
      duration: "6-8 weeks",
      icon: "🧠",
      description: "Supervised/unsupervised learning, neural networks, and model evaluation.",
    },
    sql: {
      title: "SQL for Data Science",
      platform: "SQLBolt",
      type: "Interactive",
      duration: "2-3 weeks",
      icon: "🗃️",
      description: "Queries, joins, aggregations, subqueries, and database design.",
    },
    excel: {
      title: "Advanced Excel Skills",
      platform: "Excel Easy",
      type: "Tutorial",
      duration: "2-3 weeks",
      icon: "📗",
      description: "VLOOKUP, pivot tables, macros, data analysis, and visualization.",
    },
    communication: {
      title: "Business Communication",
      platform: "Coursera",
      type: "Course",
      duration: "3-4 weeks",
      icon: "🗣️",
      description: "Professional writing, presentations, teamwork, and workplace communication.",
    },
    design: {
      title: "UI/UX Design Fundamentals",
      platform: "Google UX Design",
      type: "Certificate",
      duration: "6-8 weeks",
      icon: "🎨",
      description: "User research, wireframing, prototyping, and usability testing.",
    },
    marketing: {
      title: "Digital Marketing Basics",
      platform: "Google Digital Garage",
      type: "Certificate",
      duration: "4-6 weeks",
      icon: "📢",
      description: "SEO, social media marketing, analytics, and content strategy.",
    },
    finance: {
      title: "Financial Literacy & Analysis",
      platform: "Khan Academy",
      type: "Course",
      duration: "4-5 weeks",
      icon: "💰",
      description: "Financial statements, budgeting, investment basics, and accounting.",
    },
    writing: {
      title: "Content Writing Mastery",
      platform: "HubSpot Academy",
      type: "Certificate",
      duration: "2-3 weeks",
      icon: "✍️",
      description: "Blog writing, copywriting, SEO content, and editorial techniques.",
    },
    research: {
      title: "Research Methodology",
      platform: "NPTEL",
      type: "Course",
      duration: "4-6 weeks",
      icon: "🔬",
      description: "Research design, data collection, literature review, and academic writing.",
    },
    management: {
      title: "Project Management Essentials",
      platform: "Google PM Certificate",
      type: "Certificate",
      duration: "4-6 weeks",
      icon: "📋",
      description: "Agile, Scrum, risk management, stakeholder communication, and planning.",
    },
    healthcare: {
      title: "Healthcare Fundamentals",
      platform: "NPTEL / Swayam",
      type: "Course",
      duration: "6-8 weeks",
      icon: "🏥",
      description: "Public health basics, healthcare systems, and patient care fundamentals.",
    },
    agriculture: {
      title: "Modern Agriculture Practices",
      platform: "Swayam",
      type: "Course",
      duration: "4-6 weeks",
      icon: "🌾",
      description: "Sustainable farming, crop science, agri-tech, and soil management.",
    },
    "social media": {
      title: "Social Media Strategy",
      platform: "Meta Blueprint",
      type: "Certificate",
      duration: "3-4 weeks",
      icon: "📱",
      description: "Platform strategy, content creation, analytics, and community building.",
    },
    programming: {
      title: "Introduction to Computer Science",
      platform: "CS50 (Harvard)",
      type: "Course",
      duration: "6-8 weeks",
      icon: "💻",
      description: "Algorithms, data structures, programming paradigms, and problem solving.",
    },
    teaching: {
      title: "Pedagogy & Teaching Skills",
      platform: "NPTEL / Swayam",
      type: "Course",
      duration: "4-6 weeks",
      icon: "📚",
      description: "Lesson planning, classroom management, assessment, and student engagement.",
    },
    law: {
      title: "Introduction to Indian Law",
      platform: "Swayam",
      type: "Course",
      duration: "6-8 weeks",
      icon: "⚖️",
      description: "Constitutional law, legal research, case analysis, and legal writing.",
    },
    engineering: {
      title: "Engineering Problem Solving",
      platform: "NPTEL",
      type: "Course",
      duration: "4-6 weeks",
      icon: "⚙️",
      description: "Engineering principles, CAD, technical drawing, and applied mathematics.",
    },
    science: {
      title: "Applied Sciences",
      platform: "NPTEL / Swayam",
      type: "Course",
      duration: "4-6 weeks",
      icon: "🔬",
      description: "Lab techniques, scientific method, data interpretation, and research skills.",
    },
  };

  // Default resource for unmapped skills
  function getDefaultResource(skill) {
    return {
      title: `Learn ${skill}`,
      platform: "Google / YouTube",
      type: "Self-study",
      duration: "2-4 weeks",
      icon: "📖",
      description: `Search for beginner tutorials and courses on ${skill} to build your foundation.`,
    };
  }

  // Build resource list from gap skills
  const resources = [];
  const seen = new Set();

  gapSkills.forEach((skill) => {
    const key = skill.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);

    const resource = resourceDatabase[key] || getDefaultResource(skill);
    resources.push({ ...resource, forSkill: skill });
  });

  // Also suggest general upskilling resources from matched skills
  const bonusResources = [];
  userSkillsNorm.forEach((skill) => {
    if (resourceDatabase[skill] && !seen.has(skill)) {
      seen.add(skill);
      bonusResources.push({ ...resourceDatabase[skill], forSkill: skill, isBonus: true });
    }
  });

  if (resources.length === 0 && bonusResources.length === 0) return null;

  const typeColors = {
    Course: { background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8', border: '1px solid #93c5fd' },
    Tutorial: { background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed', border: '1px solid #c4b5fd' },
    Certificate: { background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', border: '1px solid #86efac' },
    Documentation: { background: 'linear-gradient(135deg, #cffafe, #a5f3fc)', color: '#0e7490', border: '1px solid #67e8f9' },
    Interactive: { background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', color: '#be185d', border: '1px solid #f9a8d4' },
    "Self-study": { background: 'rgba(241, 245, 249, 0.8)', color: '#64748b', border: '1px solid #e2e8f0' },
  };

  return (
    <div className="card-premium overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="px-7 py-6" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488, #10b981)', backgroundSize: '200% 200%' }}>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', width: '52px', height: '52px' }}>
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h3 className="text-white font-extrabold text-xl tracking-tight">Recommended Learning Resources</h3>
            <p className="text-emerald-100/80 text-xs font-semibold">
              {resources.length > 0
                ? `${resources.length} resources to fill your skill gaps`
                : "Resources to strengthen your expertise"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-7">
        {/* Gap-filling resources */}
        {resources.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)' }}>🎯</span>
              Priority Learning (Fill Skill Gaps)
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {resources.slice(0, 6).map((resource) => (
                <div
                  key={resource.forSkill}
                  className="group p-4 rounded-2xl transition-all duration-300 hover:shadow-md"
                  style={{ background: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(226, 232, 240, 0.5)' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{resource.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-bold text-gray-900 leading-snug">
                        {resource.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-500 font-medium">{resource.platform}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={typeColors[resource.type] || typeColors["Self-study"]}>
                          {resource.type}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">⏱ {resource.duration}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                        {resource.description}
                      </p>
                      <div className="mt-2.5">
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg, #fef9c3, #fde68a)', color: '#a16207', border: '1px solid #fcd34d' }}>
                          For: {resource.forSkill}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bonus: strengthen existing skills */}
        {bonusResources.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>💪</span>
              Strengthen Your Strengths
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {bonusResources.slice(0, 4).map((resource) => (
                <div
                  key={resource.forSkill}
                  className="p-4 rounded-2xl transition-all duration-300 hover:shadow-md"
                  style={{ background: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(226, 232, 240, 0.5)' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{resource.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-bold text-gray-900 leading-snug">
                        {resource.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-500 font-medium">{resource.platform}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={typeColors[resource.type] || typeColors["Self-study"]}>
                          {resource.type}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">⏱ {resource.duration}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
