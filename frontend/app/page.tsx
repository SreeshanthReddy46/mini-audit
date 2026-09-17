'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  History,
  FileCheck2,
  Bot,
  Layers,
  Database,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Server,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CornerStars } from '../components/ui/CornerStars';

export default function RootLandingPage() {
  const workflowStages = [
    {
      step: '01',
      title: 'PENDING',
      actor: 'System / Checklist',
      description: 'Document requirement is initialized in the client compliance audit checklist.',
      rule: 'Cannot transition directly to APPROVED.',
    },
    {
      step: '02',
      title: 'UPLOADED',
      actor: 'Staff (Rohit)',
      description: 'Initial document file uploaded. Private storage key generated; SHA-256 hash computed & version 1 created.',
      rule: 'Creates immutable DocumentVersion record.',
    },
    {
      step: '03',
      title: 'UNDER_REVIEW',
      actor: 'Reviewer (Aman)',
      description: 'CA reviewer takes ownership of the document and initiates formal compliance review.',
      rule: 'Staff cannot initiate review (403 Forbidden).',
    },
    {
      step: '04',
      title: 'CORRECTION_REQUIRED',
      actor: 'Reviewer (Aman)',
      description: 'Deficiencies found. Reviewer requests correction with mandatory rationale comment.',
      rule: 'Rejection requires non-empty comment (422 Unprocessable).',
    },
    {
      step: '05',
      title: 'APPROVED',
      actor: 'Reviewer (Aman)',
      description: 'Final sign-off. Compliance document is verified, locked, and permanently recorded in audit history.',
      rule: 'Terminal approval state; cannot be rolled back.',
    },
  ];

  const pillars = [
    {
      icon: Lock,
      title: 'Multi-Tenant Isolation',
      badge: 'Zero Cross-Talk',
      description:
        'Firm A (ABC & Co.) and Firm B (XYZ & Co.) are strictly isolated. Querying another firm\'s client or document returns 404 Not Found (never 403) to block IDOR probing.',
    },
    {
      icon: History,
      title: 'Append-Only Audit Trail',
      badge: 'Immutable Ledger',
      description:
        'Every status modification, file upload, and reviewer note is logged in the same database transaction with actor ID, IP address, user agent, and timestamp.',
    },
    {
      icon: Layers,
      title: 'First-Class Document Versioning',
      badge: 'SHA-256 Fingerprints',
      description:
        'When corrections are uploaded, prior versions are never overwritten. Every revision is preserved with cryptographic SHA-256 hash digests and file sizes.',
    },
    {
      icon: Bot,
      title: 'Restricted AI Advisory Assistant',
      badge: 'Advisory Only',
      description:
        '"AI can recommend. The backend decides." AI inspects documents for closing balances, GSTIN format, and prompt-injection attacks with zero approval authority.',
    },
    {
      icon: Database,
      title: 'Private File Storage',
      badge: 'Isolated Keys',
      description:
        'Files are stored under server-generated paths: firms/{firm_id}/clients/{client_id}/... Direct public URL access is prohibited; streaming requires auth.',
    },
    {
      icon: Server,
      title: 'Defense-in-Depth Security',
      badge: 'OWASP Compliant',
      description:
        'Standardized error envelopes with X-Request-ID correlation, in-memory sliding-window rate limiting, and security headers (nosniff, DENY, XSS protection).',
    },
  ];

  const checklistDocs = [
    { name: 'Bank Statement', check: 'Closing balance reconciliation & debit/credit consistency.' },
    { name: 'Sales Register', check: 'Sequential tax invoice numbers and outward supply summaries.' },
    { name: 'Purchase Register', check: 'Input Tax Credit (ITC) eligibility and supplier vendor validation.' },
    { name: 'GST Return (GSTR-3B)', check: '15-digit GSTIN syntax verification and tax liability match.' },
    { name: 'Expense Summary', check: 'Direct vs indirect categorization and voucher receipts.' },
  ];

  const personas = [
    {
      name: 'Rohit',
      firm: 'Firm A (ABC & Co.)',
      role: 'STAFF',
      email: 'rohit@abc.com',
      action: 'Can upload files, re-upload revisions, and view audit history.',
    },
    {
      name: 'Aman',
      firm: 'Firm A (ABC & Co.)',
      role: 'REVIEWER',
      email: 'aman@abc.com',
      action: 'Can review documents, request corrections with reasons, approve, and view AI findings.',
    },
    {
      name: 'Priya',
      firm: 'Firm B (XYZ & Co.)',
      role: 'REVIEWER (TENANT B)',
      email: 'priya@xyz.com',
      action: 'Demonstrates tenant isolation. Attempting to view Firm A data returns 404 Not Found.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <div className="sticky top-4 z-50 px-4 sm:px-6 w-full pointer-events-none">
        <header className="max-w-6xl mx-auto pointer-events-auto group relative rounded-2xl border border-neutral-200/90 bg-white/85 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.05)] px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 hover:border-neutral-400/80 hover:shadow-[0_12px_36px_rgb(0,0,0,0.08)]">
          <CornerStars size="sm" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-sm shadow-xs transition-transform group-hover:scale-105">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-sm text-neutral-900">MINI AUDIT</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 pl-2 border-l border-neutral-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Enterprise CA
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/70">
            <a href="#workflow" className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all">Workflow</a>
            <a href="#pillars" className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all">Pillars</a>
            <a href="#architecture" className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all">Architecture</a>
            <a href="#checklist" className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all">Checklist</a>
            <a href="#personas" className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all">Personas</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" className="gap-2 rounded-xl text-xs font-bold">
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </header>
      </div>

      <section className="pt-24 pb-20 md:pt-32 md:pb-28 px-6 max-w-7xl mx-auto text-center border-b border-neutral-200">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-900 mb-6">
          <ShieldCheck className="w-4 h-4 text-neutral-900" />
          <span>Chartered Accountant Document Review & Verification System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-neutral-900 max-w-4xl mx-auto leading-tight">
          Deterministic Audit Document Review & Verification
        </h1>

        <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
          A production-grade, zero-trust audit review platform for CA firms. Deterministic backend rules control access, tenant boundaries, state transitions, and append-only audit logging.
        </p>

        <div className="group relative mt-10 max-w-2xl mx-auto p-6 rounded-2xl border-2 border-neutral-900 bg-white shadow-sm text-left hover-lift">
          <CornerStars size="lg" />
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-neutral-900 mb-2">
            <Sparkles className="w-4 h-4 text-neutral-900 animate-pulse-subtle" />
            Core Architectural Invariant
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900">
            &ldquo;AI can recommend. The backend decides.&rdquo;
          </p>
          <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
            The AI agent assists human reviewers with document classification, extraction, and anomaly detection. It possesses zero permissions to execute SQL, bypass authentication, mutate workflow state, or approve documents.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2 px-7 py-3.5 text-sm shadow-md rounded-xl">
              Get Started (Sign In)
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#architecture">
            <Button variant="outline" size="lg" className="gap-2 px-6 py-3.5 text-sm rounded-xl">
              View Architecture Blueprint
            </Button>
          </a>
        </div>
      </section>

      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto border-b border-neutral-200">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            <Workflow className="w-3.5 h-3.5 text-neutral-900" /> Deterministic State Transitions
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            5-Stage Document Lifecycle Pipeline
          </h2>
          <p className="mt-3 text-sm text-neutral-600 font-medium">
            The backend strictly rejects invalid jumps (e.g. PENDING → APPROVED or STAFF → APPROVED).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowStages.map((stage) => (
            <div
              key={stage.step}
              className="group relative p-5 rounded-xl border border-neutral-300 bg-white hover:border-neutral-900 transition-all duration-200 hover-lift flex flex-col justify-between"
            >
              <CornerStars size="sm" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black font-mono text-neutral-400 group-hover:text-neutral-900 transition-colors">{stage.step}</span>
                  <span className="text-xs font-mono font-bold text-neutral-600">
                    {stage.actor}
                  </span>
                </div>
                <h3 className="text-sm font-black text-neutral-900 tracking-tight mb-2">{stage.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{stage.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200">
                <p className="text-[10px] font-mono text-neutral-900 font-bold">Rule: {stage.rule}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pillars" className="py-20 px-6 max-w-7xl mx-auto border-b border-neutral-200">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            <Layers className="w-3.5 h-3.5 text-neutral-900" /> System Invariants
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            Built for Real-World CA Compliance
          </h2>
          <p className="mt-3 text-sm text-neutral-600 font-medium">
            Designed to address the 75 marks concentrated in workflow, audit trail, data design, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative p-6 rounded-2xl border border-neutral-300 bg-white hover:border-neutral-900 transition-all duration-200 hover-lift"
              >
                <CornerStars />
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-neutral-900">{pillar.title}</h3>
                  <span className="text-xs font-mono font-medium text-neutral-500">
                    {pillar.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto border-b border-neutral-200">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            <Server className="w-3.5 h-3.5 text-neutral-900" /> Complete Technical Stack
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            System Architecture Blueprint
          </h2>
          <p className="mt-3 text-sm text-neutral-600 font-medium">
            Separation of concerns: API → Services → Repositories → Database.
          </p>
        </div>

        <div className="group relative p-8 rounded-2xl border-2 border-neutral-900 bg-white font-mono text-xs overflow-x-auto shadow-sm hover-lift">
          <CornerStars size="lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="group/item relative p-4 rounded-xl border border-neutral-300 bg-neutral-50 hover:border-neutral-900 transition-colors">
              <CornerStars size="sm" />
              <span className="text-[10px] font-black uppercase text-neutral-500">Presentation Layer</span>
              <h4 className="font-bold text-neutral-900 text-sm mt-1">Next.js 14 App Router</h4>
              <p className="text-[11px] text-neutral-600 mt-2 font-sans">
                TypeScript, Tailwind CSS, Lucide Icons, Persona Switcher.
              </p>
            </div>

            <div className="group/item relative p-4 rounded-xl border border-neutral-300 bg-neutral-50 hover:border-neutral-900 transition-colors">
              <CornerStars size="sm" />
              <span className="text-[10px] font-black uppercase text-neutral-500">API Gateway</span>
              <h4 className="font-bold text-neutral-900 text-sm mt-1">FastAPI Backend</h4>
              <p className="text-[11px] text-neutral-600 mt-2 font-sans">
                Auth, RBAC, Validation, Security Headers, Rate Limiting.
              </p>
            </div>

            <div className="group/item relative p-4 rounded-xl border border-neutral-300 bg-neutral-50 hover:border-neutral-900 transition-colors">
              <CornerStars size="sm" />
              <span className="text-[10px] font-black uppercase text-neutral-500">Data & Storage</span>
              <h4 className="font-bold text-neutral-900 text-sm mt-1">PostgreSQL + Storage</h4>
              <p className="text-[11px] text-neutral-600 mt-2 font-sans">
                Firms, Users, Clients, Documents, DocumentVersions, Reviews.
              </p>
            </div>

            <div className="group/item relative p-4 rounded-xl border border-neutral-300 bg-neutral-50 hover:border-neutral-900 transition-colors">
              <CornerStars size="sm" />
              <span className="text-[10px] font-black uppercase text-neutral-500">Audit & AI</span>
              <h4 className="font-bold text-neutral-900 text-sm mt-1">Append-Only + AI Agent</h4>
              <p className="text-[11px] text-neutral-600 mt-2 font-sans">
                Append-only event ledger & advisory document analyzer.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-300 text-center font-sans text-xs text-neutral-700 font-bold">
            Data Flow: USER REQUEST → AUTHENTICATE → AUTHORIZE → VALIDATE → CHECK TENANT → CHECK STATE → EXECUTE → WRITE AUDIT EVENT → RETURN
          </div>
        </div>
      </section>

      <section id="checklist" className="py-20 px-6 max-w-7xl mx-auto border-b border-neutral-200">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            <FileCheck2 className="w-3.5 h-3.5 text-neutral-900" /> Standardized Audit Checklist
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            5 Required Compliance Documents
          </h2>
          <p className="mt-3 text-sm text-neutral-600 font-medium">
            Pre-seeded for ABC Traders (Firm A) and XYZ Manufacturing (Firm B).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {checklistDocs.map((doc) => (
            <div key={doc.name} className="group relative p-4 rounded-xl border border-neutral-300 bg-white hover:border-neutral-900 transition-all duration-200 hover-lift">
              <CornerStars size="sm" />
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-neutral-900 shrink-0" />
                <h3 className="text-sm font-bold text-neutral-900">{doc.name}</h3>
              </div>
              <p className="text-xs text-neutral-600 font-medium">{doc.check}</p>
            </div>
          ))}
          <div className="group relative p-4 rounded-xl border border-dashed border-neutral-400 bg-neutral-50 hover:border-neutral-900 flex items-center justify-center text-center transition-colors">
            <CornerStars size="sm" />
            <p className="text-xs font-bold text-neutral-700">
              + Custom Client Documents Supported
            </p>
          </div>
        </div>
      </section>

      <section id="personas" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            <UserCheck className="w-3.5 h-3.5 text-neutral-900" /> Ready for Evaluator Demo
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            Pre-Seeded Evaluation Accounts
          </h2>
          <p className="mt-3 text-sm text-neutral-600 font-medium">
            Click any persona to launch directly into the workspace with full credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p) => (
            <div
              key={p.email}
              className="group relative p-6 rounded-2xl border-2 border-neutral-300 bg-white hover:border-neutral-900 transition-all duration-200 hover-lift flex flex-col justify-between"
            >
              <CornerStars />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{p.firm}</span>
                  <span className="text-xs font-mono font-bold text-neutral-600">
                    {p.role}
                  </span>
                </div>
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">{p.name}</h3>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">{p.email}</p>
                <p className="text-xs text-neutral-600 mt-4 leading-relaxed font-medium">{p.action}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200">
                <Link
                  href={`/login?email=${encodeURIComponent(p.email)}`}
                  className="w-full block"
                >
                  <Button variant="primary" size="sm" className="w-full gap-2 group/btn rounded-xl">
                    Sign In as {p.name}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-neutral-900 text-white font-black text-xs flex items-center justify-center">
              A
            </div>
            <span className="font-bold text-neutral-900">MINI AUDIT</span>
            <span>— CA Document Review & Compliance Verification</span>
          </div>

          <div className="flex items-center gap-6 text-neutral-900 font-bold">
            <Link href="/login">
              <Button size="sm" variant="outline" className="gap-1.5 rounded-xl">
                Get Started →
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
