import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code2, Send, AlertCircle, CheckCircle2, Loader2, ChevronRight } from "lucide-react";

interface ReviewIssue {
  type: string;
  severity: string;
  description: string;
  suggestion: string;
}

interface ReviewResult {
  summary: string;
  issues: ReviewIssue[];
  score: number;
}

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);

  const handleReview = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Analyse fehlgeschlagen");
      }

      setResult(data);
    } catch (err: any) {
      setError({
        message: "Fehler bei der Analyse",
        details: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "hoch": return "text-red-500 bg-red-50 border-red-100";
      case "mittel": return "text-amber-500 bg-amber-50 border-amber-100";
      case "niedrig": return "text-blue-500 bg-blue-50 border-blue-100";
      default: return "text-gray-500 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Code2 className="w-10 h-10 text-indigo-600" />
              AI Code Reviewer
            </h1>
            <p className="text-gray-500 text-lg">Professionelle Code-Analyse in Sekunden.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
              Powered by Gemini 3 Flash
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-bottom border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">Eingabe</span>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Füge hier deinen Code ein..."
                className="w-full h-[500px] p-6 font-mono text-sm resize-none focus:outline-none bg-white"
                spellCheck={false}
              />
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleReview}
                  disabled={loading || !code.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Review starten
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Result Section */}
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              {!result && !error && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                >
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Code2 className="w-10 h-10 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Bereit für die Analyse</h3>
                  <p className="text-gray-500 max-w-xs">
                    Füge deinen Code links ein und klicke auf "Review starten", um eine detaillierte Analyse zu erhalten.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Code2 className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <p className="mt-8 text-lg font-medium text-gray-600 animate-pulse">
                    Gemini analysiert deinen Code...
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-800 mb-2">{error.message}</h3>
                      <div className="bg-white/50 p-4 rounded-lg border border-red-100 font-mono text-xs text-red-700 overflow-auto max-h-[300px]">
                        {error.details}
                      </div>
                      <button 
                        onClick={handleReview}
                        className="mt-6 text-red-700 font-semibold flex items-center gap-1 hover:underline"
                      >
                        Erneut versuchen <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">Zusammenfassung</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Score</span>
                        <div className={`text-3xl font-black ${result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {result.score}/100
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {result.summary}
                    </p>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Gefundene Probleme ({result.issues.length})</h4>
                    {result.issues.map((issue, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <span className="font-bold text-gray-700">{issue.type}</span>
                          </div>
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Problem</span>
                            <p className="text-gray-700">{issue.description}</p>
                          </div>
                          <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                            <span className="text-xs font-bold text-indigo-400 uppercase block mb-1">Vorschlag</span>
                            <p className="text-indigo-900 font-medium">{issue.suggestion}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {result.issues.length === 0 && (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-12 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800">Hervorragender Code!</h3>
                      <p className="text-green-700">Keine Probleme gefunden. Dein Code entspricht den Best Practices.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
