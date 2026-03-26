import { TranslationContent } from "../data/translations.ts";

interface FooterProps {
  t: TranslationContent;
}

export default function Footer({ t }: FooterProps) {
  return (
    <footer className="bg-[#14141f] border-t border-white/5 pt-[60px] px-6 sm:px-12 pb-[40px] mt-20 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-[-100px] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          {/* Brand & Description */}
          <div className="lg:max-w-md">
            <div className="flex items-center gap-3 mb-6 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">🎯</span>
              </div>
              <span className="text-xl font-display font-black text-white tracking-tighter">InternAI</span>
            </div>
            <p className="text-[#5a5a78] text-[15px] leading-relaxed mb-8">
              Revolutionizing the internship search experience through advanced AI matching and skill gap analysis. Empowering the next generation of professional talent with data-driven career insights.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { name: 'GitHub', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                { name: 'LinkedIn', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> }
              ].map(social => (
                <button key={social.name} className="w-10 h-10 rounded-lg bg-[#1a1a28] border border-white/5 flex items-center justify-center text-[#5a5a78] hover:text-white hover:border-accent/30 hover:shadow-[0_0_15px_rgba(108,99,255,0.15)] transition-all transform hover:-translate-y-1">
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            {[
              { title: 'Product', links: ['Matches', 'Dashboard', 'Skill Gap', 'Learning'] },
              { title: 'Tech', links: ['React 18', 'Tailwind', 'MongoDB', 'Redis'] },
              { title: 'Developer', links: ['API Docs', 'GitHub', 'LinkedIn', 'Portfolio'] }
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#5a5a78] mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-[14px] text-[#5a5a78] hover:text-[#e8e8f0] transition-colors font-medium">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[13px] text-[#5a5a78] font-medium order-2 md:order-1">
            Built by <span className="text-white">Ruturaj Nandedkar</span> · 2026
          </div>

          <div className="flex flex-wrap justify-center gap-3 order-1 md:order-2">
            {['React 18', 'Node.js', 'MongoDB', 'TF-IDF'].map(tech => (
              <span key={tech} className="px-3 py-1 rounded-full bg-[#1a1a28] border border-white/5 text-[11px] font-mono font-bold text-[#5a5a78]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
