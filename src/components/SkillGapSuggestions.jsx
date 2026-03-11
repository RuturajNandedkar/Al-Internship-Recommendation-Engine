export default function SkillGapSuggestions({ results, userSkills }) {
  if (!results || results.length === 0) return null;

  // Collect all required skills from recommended internships
  const requiredSkillsMap = {};
  results.forEach((r) => {
    (r.skills || []).forEach((skill) => {
      const key = skill.toLowerCase().trim();
      if (!requiredSkillsMap[key]) {
        requiredSkillsMap[key] = { name: skill, count: 0, internships: [] };
      }
      requiredSkillsMap[key].count++;
      if (!requiredSkillsMap[key].internships.includes(r.title)) {
        requiredSkillsMap[key].internships.push(r.title);
      }
    });
  });

  // Normalize user skills for matching
  const userSkillsNorm = (userSkills || []).map((s) => s.toLowerCase().trim());

  // Separate into matched and gap skills
  const matchedSkills = [];
  const gapSkills = [];

  Object.values(requiredSkillsMap).forEach((skill) => {
    const isMatched = userSkillsNorm.some(
      (us) => skill.name.toLowerCase().includes(us) || us.includes(skill.name.toLowerCase())
    );
    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      gapSkills.push(skill);
    }
  });

  // Sort gaps by demand (most required first)
  gapSkills.sort((a, b) => b.count - a.count);

  const totalRequired = Object.keys(requiredSkillsMap).length;
  const coveragePercent = totalRequired > 0 ? Math.round((matchedSkills.length / totalRequired) * 100) : 0;

  return (
    <div className="card-premium overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="px-7 py-6" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c, #f59e0b)', backgroundSize: '200% 200%' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', width: '52px', height: '52px' }}>
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-white font-extrabold text-xl tracking-tight">Skill Gap Analysis</h3>
              <p className="text-amber-100/80 text-xs font-semibold">Based on your recommended internships</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-white">{coveragePercent}%</div>
            <div className="text-[10px] text-amber-100/80 uppercase tracking-widest font-bold">Coverage</div>
          </div>
        </div>
      </div>

      <div className="p-7 space-y-7">
        {/* Coverage bar */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500 font-medium">Skill Coverage</span>
            <span className="font-bold text-gray-700">
              {matchedSkills.length} of {totalRequired} skills matched
            </span>
          </div>
          <div className="w-full rounded-full h-3.5 overflow-hidden" style={{ background: 'rgba(241, 245, 249, 0.8)' }}>
            <div
              className="h-3.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${coveragePercent}%`, background: 'linear-gradient(90deg, #f59e0b, #ea580c)' }}
            />
          </div>
        </div>

        {/* Your strengths */}
        {matchedSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>✅</span>
              Your Strengths
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {matchedSkills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', border: '1px solid #86efac' }}
                >
                  {skill.name}
                  <span className="text-[10px] opacity-70">
                    · {skill.count} {skill.count === 1 ? "match" : "matches"}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skill gaps */}
        {gapSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)' }}>🎯</span>
              Skills to Develop
            </h4>
            <div className="space-y-2.5">
              {gapSkills.slice(0, 8).map((skill) => {
                const priority =
                  skill.count >= 3 ? "High" : skill.count >= 2 ? "Medium" : "Low";
                const priorityStyle =
                  skill.count >= 3
                    ? { background: 'linear-gradient(135deg, #fef2f2, #fecaca)', color: '#dc2626', border: '1px solid #fca5a5' }
                    : skill.count >= 2
                    ? { background: 'linear-gradient(135deg, #fef9c3, #fde68a)', color: '#a16207', border: '1px solid #fcd34d' }
                    : { background: 'rgba(241, 245, 249, 0.8)', color: '#64748b', border: '1px solid #e2e8f0' };

                return (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                    style={{ background: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(226, 232, 240, 0.5)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-gray-800">{skill.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={priorityStyle}>
                        {priority} Priority
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Needed in {skill.count} {skill.count === 1 ? "internship" : "internships"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gapSkills.length === 0 && matchedSkills.length > 0 && (
          <div className="text-center py-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', border: '1px solid #86efac' }}>
            <span className="text-3xl">🎉</span>
            <p className="text-sm font-bold text-green-700 mt-2">
              Great job! Your skills cover all recommended internship requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
