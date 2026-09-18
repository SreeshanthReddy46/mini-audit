'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lock,
  History,
  FileCheck2,
  Bot,
  Layers,
  Database,
  FileText,
  UserCheck,
  Server,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

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
      tag: 'Strict Boundary',
      description:
        'Firm A (ABC & Co.) and Firm B (XYZ & Co.) are strictly isolated. Querying another firm\'s client or document returns 404 Not Found to block IDOR probing.',
    },
    {
      icon: History,
      title: 'Append-Only Audit Trail',
      tag: 'Audit Ledger',
      description:
        'Every status modification, file upload, and reviewer note is logged in the same database transaction with actor ID, IP address, user agent, and timestamp.',
    },
    {
      icon: Layers,
      title: 'Document Versioning',
      tag: 'SHA-256 Hashes',
      description:
        'When corrections are uploaded, prior versions are never overwritten. Every revision is preserved with cryptographic SHA-256 hash digests and file sizes.',
    },
    {
      icon: Bot,
      title: 'AI Advisory Assistant',
      tag: 'Advisory Only',
      description:
        '"AI can recommend. The backend decides." AI inspects documents for closing balances, GSTIN format, and anomalies with zero approval authority.',
    },
    {
      icon: Database,
      title: 'Private File Storage',
      tag: 'Isolated Keys',
      description:
        'Files are stored under server-generated paths. Direct public URL access is prohibited; file streaming requires authenticated session.',
    },
    {
      icon: Server,
      title: 'Defense-in-Depth Security',
      tag: 'Robust Middleware',
      description:
        'Standardized error envelopes with X-Request-ID correlation, in-memory rate limiting, and standard security headers.',
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
      role: 'Staff',
      email: 'rohit@abc.com',
      action: 'Upload files, re-upload revisions, and inspect document audit history.',
    },
    {
      name: 'Aman',
      firm: 'Firm A (ABC & Co.)',
      role: 'Reviewer',
      email: 'aman@abc.com',
      action: 'Inspect documents, request corrections with mandatory reasons, and approve.',
    },
    {
      name: 'Priya',
      firm: 'Firm B (XYZ & Co.)',
      role: 'Reviewer (Tenant B)',
      email: 'priya@xyz.com',
      action: 'Demonstrates tenant boundary isolation. Cross-tenant queries return 404 Not Found.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-8 sticky top-0 z-30 h-16 flex items-center">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
            <span className="font-bold tracking-tight text-sm text-neutral-900">MINI AUDIT</span>
            <span className="text-neutral-300 text-sm hidden sm:inline">/</span>
            <span className="text-sm text-neutral-500 hidden sm:inline">CA Document Verification</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-neutral-600 font-medium">
            <a href="#workflow" className="hover:text-neutral-900 transition-colors">Workflow</a>
            <a href="#pillars" className="hover:text-neutral-900 transition-colors">Pillars</a>
            <a href="#architecture" className="hover:text-neutral-900 transition-colors">Architecture</a>
            <a href="#checklist" className="hover:text-neutral-900 transition-colors">Checklist</a>
            <a href="#personas" className="hover:text-neutral-900 transition-colors">Personas</a>
          </nav>

          <Link href="/login">
            <Button size="sm" className="rounded-md">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <section className="pt-24 pb-20 px-8 max-w-5xl mx-auto text-center space-y-5">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
          Statutory Document Review System
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Production-grade chartered accountancy workflow enforcing deterministic state transitions,
          strict multi-tenant isolation, cryptographic versioning, and immutable audit logging.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3.5">
          <Link href="/login">
            <Button size="md" className="rounded-md gap-2">
              Launch Workspace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#workflow">
            <Button variant="outline" size="md" className="rounded-md">
              View Workflow
            </Button>
          </a>
        </div>
      </section>

      <section id="workflow" className="py-20 px-8 max-w-7xl mx-auto border-t border-neutral-200">
        <div className="mb-12 space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Lifecycle Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            5-Stage Document Review Pipeline
          </h2>
          <p className="text-sm text-neutral-500">
            Deterministic state machine preventing unauthorized or out-of-order transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowStages.map((stage) => (
            <div
              key={stage.step}
              className="p-5 sm:p-6 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between space-y-4 hover-card"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <span className="font-mono font-semibold text-neutral-800">{stage.step}</span>
                  <span className="text-neutral-500 font-medium">{stage.actor}</span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1.5">{stage.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{stage.description}</p>
              </div>
              <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-400">
                Rule: {stage.rule}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pillars" className="py-20 px-8 max-w-7xl mx-auto border-t border-neutral-200">
        <div className="mb-12 space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Core Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Enterprise Invariants
          </h2>
          <p className="text-sm text-neutral-500">
            Security, auditability, and data integrity guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 sm:p-7 rounded-xl border border-neutral-200 bg-white space-y-3 hover-card"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900">{pillar.title}</h3>
                  <span className="text-xs font-mono text-neutral-400">{pillar.tag}</span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="checklist" className="py-20 px-8 max-w-7xl mx-auto border-t border-neutral-200">
        <div className="mb-12 space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Compliance Checklist
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Standard Statutory Documents
          </h2>
          <p className="text-sm text-neutral-500">
            Pre-seeded for client compliance engagements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {checklistDocs.map((doc) => (
            <div key={doc.name} className="p-5 rounded-xl border border-neutral-200 bg-white space-y-1.5 hover-card">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4.5 h-4.5 text-neutral-700 shrink-0" />
                <h3 className="text-sm font-semibold text-neutral-900">{doc.name}</h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500">{doc.check}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="personas" className="py-20 px-8 max-w-7xl mx-auto border-t border-neutral-200">
        <div className="mb-12 space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Demo Accounts
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Evaluation Personas
          </h2>
          <p className="text-sm text-neutral-500">
            Pre-seeded test users to demonstrate staff uploads, reviewer inspection, and multi-tenant isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {personas.map((p) => (
            <div
              key={p.email}
              className="p-6 sm:p-7 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between space-y-5 hover-card"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2.5">
                  <span className="font-medium text-neutral-500">{p.firm}</span>
                  <span className="font-mono text-neutral-800 font-semibold">{p.role}</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{p.name}</h3>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">{p.email}</p>
                <p className="text-sm text-neutral-600 mt-2.5 leading-relaxed">{p.action}</p>
              </div>

              <div className="pt-3.5 border-t border-neutral-100">
                <Link
                  href={`/login?email=${encodeURIComponent(p.email)}`}
                  className="w-full block"
                >
                  <Button variant="outline" size="sm" className="w-full rounded-md justify-between">
                    <span>Sign In as {p.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">MINI AUDIT</span>
            <span>— Statutory Document Review</span>
          </div>

          <Link href="/login">
            <Button size="sm" variant="outline" className="rounded-md">
              Launch App →
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
