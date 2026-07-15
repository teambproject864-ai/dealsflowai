import { GlassPanel } from "@/components/immersive/GlassPanel";

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#060612] text-slate-100 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <header className="space-y-4 mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Security Posture
          </h1>
          <p className="text-slate-400">Enterprise Grade Guardrails & Data Custody</p>
        </header>

        <GlassPanel material="glass" depth="mid" className="p-8 md:p-12 border-white/10 shadow-2xl space-y-8 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Compliance & Certifications</h2>
            <p>
              DealFlow AI is committed to establishing and maintaining enterprise-grade safety standards. We are SOC 2 Type II certified and adhere strictly to GDPR principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Cryptographic Controls</h2>
            <p>
              All PII data, including contact emails and phone numbers, are encrypted at rest using AES-256-GCM (Galois/Counter Mode). Encryption keys are managed securely via Google Cloud KMS and are rotated periodically.
            </p>
            <p>
              Data in transit is protected using TLS 1.3 or higher, preventing interception or modification.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Network & Infrastructure Security</h2>
            <p>
              Our application infrastructure is hosted on secure cloud providers. We implement least-privilege IAM policies, automated firewalls (Clawpatrol), and real-time monitoring to intercept anomalies or malicious activity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Threat Prevention</h2>
            <p>
              Our proprietary Clawpatrol firewall runs inline on all multi-agent execution steps, scanning inputs and outputs for prompt injections, scripting attempts, or prototype pollution to guarantee clean execution boundaries.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Security Incident Response</h2>
            <p>
              We maintain a documented incident response plan to address any potential data breach. If you detect a vulnerability, please report it immediately to security@dealflow.ai.
            </p>
          </section>
        </GlassPanel>
      </div>
    </main>
  );
}
