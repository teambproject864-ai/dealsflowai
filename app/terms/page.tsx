import { GlassPanel } from "@/components/immersive/GlassPanel";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#060612] text-slate-100 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <header className="space-y-4 mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-slate-400">Last updated: June 20, 2026</p>
        </header>

        <GlassPanel material="glass" depth="mid" className="p-8 md:p-12 border-white/10 shadow-2xl space-y-8 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and DealFlow AI, Inc., concerning your access to and use of the dealflow.ai website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. User Representations</h2>
            <p>
              By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information; (3) you have the legal capacity and you agree to comply with these Terms of Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Governing Law</h2>
            <p>
              These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.
            </p>
          </section>
        </GlassPanel>
      </div>
    </main>
  );
}
