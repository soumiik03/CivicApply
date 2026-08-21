import React, { useState } from 'react';

// Sample Mock Data mapped precisely to the document specs
const INITIAL_WORKFLOW = {
  name: "Internship Application",
  site: "internship.okcl.org",
  version: "v2",
  status: "Learned"
};

const STUDENT_PROFILE = {
  name: "John Doe",
  email: "johndoe@example.com",
  id: "ST-884920",
  course: "Civic Automation Systems",
  role: "Student"
};

export default function CivicApplyDashboard()
 {
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const handleRunAction = () => {
    setIsRunning(true);
    setExecutionResult(null);
    
    // Simulating system memory map execution lifecycle
    setTimeout(() => {
      setIsRunning(false);
      setExecutionResult({
        message: "Application workflow completed",
        version: "v2",
        stepsCompleted: [
          "Student profile metrics authenticated", 
          "Remote network host discovered", 
          "Workflow logic maps parsed successfully", 
          "Pre-submission workflow safety anchor locked"
        ],
        timestamp: new Date().toLocaleTimeString()
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Chapter 1 — Civic Apply Dashboard UI</h1>
            <p className="text-slate-400 mt-0.5 text-xs">Specification Compliance Workspace • Core Version {INITIAL_WORKFLOW.version}</p>
          </div>
          {/* CRITICAL DATA CONSTRAINT WARNING BLOCK */}
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-3 text-xs max-w-sm text-amber-300">
            <span className="font-semibold block mb-0.5">⚠️ UI Principle Restriction:</span>
            Do not claim that an application was actually submitted. Our current workflow stops before final submission.
          </div>
        </header>

        {/* 5-Second Rule Quick State Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Active Target</span>
            <span className="text-sm font-semibold text-slate-200">{INITIAL_WORKFLOW.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Site Mapping</span>
            <span className="text-sm font-semibold text-slate-200">{INITIAL_WORKFLOW.site}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">State Status</span>
            <span className="text-sm font-semibold text-indigo-400">{INITIAL_WORKFLOW.status}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">System Memory</span>
            <span className="text-sm font-semibold text-emerald-400">Initialized</span>
          </div>
        </div>

        {/* Two-Column Structured Operational Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left Block: Profile Info & Setup Panels */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Student Profile Subpanel */}
            <section className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/40 shadow-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 border-b border-slate-700/50 pb-1.5 flex items-center gap-1.5">
                <span>👤</span> Student Profile
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-[11px] text-slate-400 block">Identifier Name</label>
                  <p className="font-medium text-slate-200">{STUDENT_PROFILE.name}</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">System Identification</label>
                  <p className="font-mono text-xs text-slate-300 bg-slate-900/60 p-1 px-2 rounded mt-0.5 inline-block">{STUDENT_PROFILE.id}</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">Assigned Environment</label>
                  <p className="font-medium text-slate-300 text-xs">{STUDENT_PROFILE.course}</p>
                </div>
              </div>
            </section>

            {/* Workflow Info Subpanel */}
            <section className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/40 shadow-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 border-b border-slate-700/50 pb-1.5 flex items-center gap-1.5">
                <span>⚙️</span> Workflow Information
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-[11px] text-slate-400 block">Workflow Target Name</label>
                  <p className="font-semibold text-white">{INITIAL_WORKFLOW.name}</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">Endpoint Target Domain</label>
                  <p className="text-indigo-400 font-mono text-xs mt-0.5 break-all">{INITIAL_WORKFLOW.site}</p>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-700/30 mt-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Version</label>
                    <span className="inline-block bg-slate-700 text-xs px-2 py-0.5 rounded font-mono text-slate-300 mt-0.5">
                      {INITIAL_WORKFLOW.version}
                    </span>
                  </div>
                  <div className="text-right">
                    <label className="text-[10px] text-slate-400 block">Memory Mapping</label>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      {INITIAL_WORKFLOW.status}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Application Run Control Block */}
            <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <button
                onClick={handleRunAction}
                disabled={isRunning}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-200 disabled:text-slate-500 disabled:bg-slate-900/80"
              >
                {isRunning ? "Running Memory Engine..." : "▶ Run Action"}
              </button>
            </div>

          </div>

          {/* Right Block: Output Metrics Stream Terminal Panel */}
          <div className="md:col-span-2">
            <section className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-xl min-h-[385px] flex flex-col justify-between">
              
              <div>
                {/* Result Area Identification Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      📊 Result Area
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Instantly proves to reviewers that the system retains learned execution logs.</p>
                  </div>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">
                    CONSOLE_FEED
                  </span>
                </div>

                {/* Execution Context Stream Body */}
                <div className="space-y-4">
                  {isRunning ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400 font-mono">Parsing sequence nodes...</p>
                    </div>
                  ) : executionResult ? (
                    <div className="space-y-4 animate-fade-in">
                      {/* Operational Metrics Header Card */}
                      <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3.5 flex items-start gap-3">
                        <div className="w-5 h-5 rounded bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                        <div>
                          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">{executionResult.message}</h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Workflow Registry Tag: <span className="text-slate-200 font-bold">{executionResult.version}</span>
                          </p>
                        </div>
                      </div>

                      {/* Explicit Steps Array Terminal Display */}
                      <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800"></div>