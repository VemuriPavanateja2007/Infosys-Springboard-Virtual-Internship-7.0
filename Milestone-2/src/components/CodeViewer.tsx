import { useState } from 'react';
import {
  Copy,
  Check,
  FileCode,
  GitCommit,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  PYTHON_PRODUCTS_CODE,
  TEMPLATE_INDEX_HTML,
  GIT_DIFF_CODE,
} from '../data/solutionCode';

export function CodeViewer() {
  const [activeSubTab, setActiveSubTab] = useState<'python' | 'template' | 'diff' | 'guide'>('python');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('python')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'python'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>blueprints/products.py</span>
            <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded text-[10px] uppercase font-bold">
              Updated
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('template')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'template'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>templates/products/index.html</span>
            <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded text-[10px] uppercase font-bold">
              Updated
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'diff'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Git Unified Diff</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Testing & Verification Guide</span>
          </button>
        </div>

        {/* Action buttons (Copy / Download) */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'python' && (
            <>
              <button
                onClick={() =>
                  handleCopy(PYTHON_PRODUCTS_CODE, 'products.py')
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied === 'products.py' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  handleDownload('products.py', PYTHON_PRODUCTS_CODE)
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                title="Download products.py"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </>
          )}

          {activeSubTab === 'template' && (
            <>
              <button
                onClick={() =>
                  handleCopy(TEMPLATE_INDEX_HTML, 'index.html')
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied === 'index.html' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  handleDownload('index.html', TEMPLATE_INDEX_HTML)
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                title="Download index.html"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </>
          )}

          {activeSubTab === 'diff' && (
            <button
              onClick={() => handleCopy(GIT_DIFF_CODE, 'diff')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied === 'diff' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied Diff!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Git Patch</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code Display Body */}
      {activeSubTab === 'python' && (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono text-slate-200">
              blueprints/products.py
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">
                + brand_filter param & WHERE p.brand = ?
              </span>
              <span className="text-slate-500">Python 3 / Flask</span>
            </div>
          </div>
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed">
              {PYTHON_PRODUCTS_CODE}
            </pre>
          </div>
        </div>
      )}

      {activeSubTab === 'template' && (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono text-slate-200">
              templates/products/index.html
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">
                + &lt;select id="brandFilter"&gt; & pagination query preservation
              </span>
              <span className="text-slate-500">Jinja2 / HTML5 / Bootstrap</span>
            </div>
          </div>
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed">
              {TEMPLATE_INDEX_HTML}
            </pre>
          </div>
        </div>
      )}

      {activeSubTab === 'diff' && (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono text-slate-200">Unified Git Diff</span>
            <span className="text-slate-400">Can be applied via `git apply`</span>
          </div>
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed">
              {GIT_DIFF_CODE}
            </pre>
          </div>
        </div>
      )}

      {activeSubTab === 'guide' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Products Brand Filter: Implementation & Testing Guide
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Follow these steps to apply and test the changes in your local
              virtual environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                  1
                </span>
                Brand Query & Filter
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li>
                  Read <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">brand_filter = request.args.get("brand", "").strip()</code>
                </li>
                <li>
                  Append <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">WHERE p.brand = ?</code> to SQL query if present.
                </li>
                <li>
                  Fetch distinct active brands: <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">SELECT DISTINCT brand FROM products...</code>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                  2
                </span>
                Price Integrity Check
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li>
                  In <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">products.py</code> under <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">("add", "edit")</code>:
                </li>
                <li>
                  Validate <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">if data["selling_price"] &lt; data["cost_price"]:</code>
                </li>
                <li>
                  Execute <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">flash("Selling price cannot be lower than cost price.", "error")</code> and redirect back.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                  3
                </span>
                Template & Inline Warning
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li>
                  Add <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">&lt;select id="brandFilter"&gt;</code> and preserve in pagination links.
                </li>
                <li>
                  Add inline error feedback <code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">#priceFeedback</code> under Selling Price.
                </li>
                <li>
                  Add live client-side validation to prevent saving product at a loss.
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Verification Checklist:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <div className="font-semibold">Brand Filter</div>
                  <div>Select "Samsung" or "Apple" → only those products appear.</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <div className="font-semibold">Combined Filters</div>
                  <div>Category + Brand + Search works simultaneously with pagination.</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <div className="font-semibold">Price Validation (Backend)</div>
                  <div>Backend blocks save if Selling Price &lt; Cost Price with flash message.</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <div className="font-semibold">Inline Form Warning</div>
                  <div>Live warning appears immediately on the form if price is set below cost.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
