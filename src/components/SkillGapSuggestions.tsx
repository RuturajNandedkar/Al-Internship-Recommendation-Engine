import { FrontendRecommendation } from "../services/aiService.ts";
import { skillKeyMap } from "../data/translations.ts";

interface SkillGapSuggestionsProps {
  results: FrontendRecommendation[];
  userSkills: string[];
}

interface RequiredSkill {
  name: string;
  count: number;
  internships: string[];
}

export default function SkillGapSuggestions({ results, userSkills }: SkillGapSuggestionsProps) {
  if (!results || results.length === 0) return null;

  // Collect all required skills from recommended internships
  const requiredSkillsMap: Record<string, RequiredSkill> = {};
  results.forEach((r) => {
    (r.skills || []).forEach((skill) => {
      const key = skill.toLowerCase().trim();
      if (!requiredSkillsMap[key]) {
        requiredSkillsMap[key] = { name: skill, count: 0, internships: [] };
      }
      requiredSkillsMap[key].count++;
      if (!requiredSkillsMap[key].internships.includes(r.title as string)) {
        requiredSkillsMap[key].internships.push(r.title as string);
      }
    });
  });

  // Normalize user skills for matching
  const userSkillsNorm = (userSkills || []).map((s) => s.toLowerCase().trim());

  // Separate into matched and gap skills
  const matchedSkills: RequiredSkill[] = [];
  const gapSkills: RequiredSkill[] = [];

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
    <div className="card-premium overflow-hidden animate-fadeIn bg-surface/30 border border-white/5">
      {/* Header */}
      <div className="px-7 py-6" style={{ background: 'linear-gradient(135deg, var(--surface2), var(--ink))' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '52px', height: '52px' }}>
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-white font-extrabold text-xl tracking-tight font-display">Skill Gap Analysis</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Based on your recommendations</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-white font-display">{coveragePercent}%</div>
            <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Coverage</div>
          </div>
        </div>
      </div>

      <div className="p-7 space-y-7">
        {/* Coverage bar */}
        <div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
            <span className="text-white/20 font-bold">Skill Coverage</span>
            <span className="font-bold text-white/40">
              {matchedSkills.length} of {totalRequired} skills matched
            </span>
          </div>
          <div className="w-full rounded-full h-3.5 overflow-hidden bg-white/5 border border-white/5">
            <div
              className="h-3.5 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-gold/20"
              style={{ width: `${coveragePercent}%`, background: 'var(--gold)' }}
            />
          </div>
        </div>

        {/* Your strengths */}
        {matchedSkills.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>✅</span>
              Your Strengths
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {matchedSkills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1.5 text-[10px] px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                >
                  {skill.name}
                  <span className="opacity-40">
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
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>🎯</span>
              Skills to Develop
            </h4>
            <div className="space-y-2.5">
              {gapSkills.slice(0, 8).map((skill) => {
                const priority =
                  skill.count >= 3 ? "High" : skill.count >= 2 ? "Medium" : "Low";
                const priorityStyle =
                  skill.count >= 3
                    ? { background: 'rgba(244, 63, 94, 0.1)', color: 'var(--coral)', border: '1px solid rgba(244, 63, 94, 0.2)' }
                    : skill.count >= 2
                    ? { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--gold)', border: '1px solid rgba(245, 158, 11, 0.2)' }
                    : { background: 'rgba(255, 255, 255, 0.05)', color: 'white/40', border: '1px solid rgba(255, 255, 255, 0.1)' };

                return (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between py-4 px-5 rounded-2xl transition-all duration-300 hover:shadow-lg border border-white/5 bg-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white font-display">{skill.name}</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider" style={priorityStyle}>
                        {priority} Priority
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                      Needed in {skill.count} {skill.count === 1 ? "internship" : "internships"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gapSkills.length === 0 && matchedSkills.length > 0 && (
          <div className="text-center py-7 rounded-2xl border border-green/20 bg-green/10">
            <span className="text-3xl">🎉</span>
            <p className="text-sm font-bold text-green mt-3 font-display uppercase tracking-widest">
              Success! Your skills cover all requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
