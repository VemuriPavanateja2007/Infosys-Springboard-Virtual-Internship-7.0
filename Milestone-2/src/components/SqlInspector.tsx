import { useState } from 'react';
import { Copy, Check, Terminal, Play, HelpCircle } from 'lucide-react';
import { FilterState } from '../types';

interface SqlInspectorProps {
  filters: FilterState;
  totalFiltered: number;
}

export function SqlInspector({ filters, totalFiltered }: SqlInspectorProps) {
  const [copiedCount, setCopiedCount] = useState(false);
  const [copiedSelect, setCopiedSelect] = useState(false);

  // Construct dynamic SQL WHERE clause matching blueprints/products.py
  const whereClauses = ["p.status='active'"];
  const params: Array<string | number> = [];

  if (filters.search) {
    whereClauses.push('p.name LIKE ?');
    params.push(`%${filters.search}%`);
  }

  if (filters.category !== 0) {
    whereClauses.push('p.category_id = ?');
    params.push(filters.category);
  }

  // Task 1: Brand filter in WHERE clause
  if (filters.brand) {
    whereClauses.push('p.brand = ?');
    params.push(filters.brand);
  }

  const whereString = `WHERE ${whereClauses.join(' AND ')}`;

  const countQuery = `SELECT COUNT(*) AS v FROM products p ${whereString}`;

  const selectQuery = `SELECT p.*, c.name AS category_name, s.name AS supplier_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN suppliers s ON s.id = p.supplier_id
${whereString}
ORDER BY p.created_at DESC
LIMIT ? OFFSET ?;`;

  const perPage = 10;
  const offset = (filters.page - 1) * perPage;
  const selectParams = [...params, perPage, offset];

  const copyToClipboard = (text: string, type: 'count' | 'select') => {
    navigator.clipboard.writeText(text);
    if (type === 'count') {
      setCopiedCount(true);
      setTimeout(() => setCopiedCount(false), 2000);
    } else {
      setCopiedSelect(true);
      setTimeout(() => setCopiedSelect(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">
              Backend SQLite Query Generator
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
              Status: Valid & Executed
            </span>
            <span className="text-xs text-slate-400">
              Matched Rows: <strong className="text-white">{totalFiltered}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          This panel mirrors the exact Python SQL construction in{' '}
          <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            blueprints/products.py
          </code>
          . Notice how <code className="text-emerald-300 font-bold">p.brand = ?</code> is dynamically injected into the parameter array safely to prevent SQL injection.
        </p>

        {/* 1. Main Paginated Select Query */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              1. Paginated Products Retrieval Query (with Brand, Search, & Category)
            </span>
            <button
              onClick={() => copyToClipboard(selectQuery, 'select')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copiedSelect ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-indigo-200 overflow-x-auto border border-slate-800 leading-relaxed">
            {selectQuery}
          </pre>

          {/* Bound Parameters Display */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Bound Parameters tuple: </span>
            <span className="text-amber-300 font-semibold">
              {JSON.stringify(selectParams)}
            </span>
          </div>
        </div>

        {/* 2. Count Query for Pagination */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              2. Total Matching Items Count Query
            </span>
            <button
              onClick={() => copyToClipboard(countQuery, 'count')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copiedCount ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-indigo-200 overflow-x-auto border border-slate-800">
            {countQuery}
          </pre>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Bound Parameters: </span>
            <span className="text-amber-300 font-semibold">
              {JSON.stringify(params)}
            </span>
          </div>
        </div>

        {/* 3. Distinct Brands Query */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              3. Distinct Brands Dropdown Population Query
            </span>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
            SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND TRIM(brand) != '' AND status='active' ORDER BY brand;
          </pre>
        </div>
      </div>

      {/* Task Explanation Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          Why Parameterized Queries (`WHERE p.brand = ?`) Matter
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Using parameter placeholders (<code className="text-indigo-700 bg-slate-100 px-1 py-0.5 rounded font-mono">?</code>) ensures safe database querying against SQL Injection attacks. If a user enters special characters or quotes in brand names (e.g. <em>Men's Wear</em> or <em>L'Oreal</em>), SQLite handles escaping automatically through the database driver.
        </p>
      </div>
    </div>
  );
}
