import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, AlertCircle, FileText } from "lucide-react";
import api from "../api/client";

export default function FeatureWorkspace({ title, description, endpoint, columns = [] }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(endpoint);
      const data = response.data;
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      setError(err?.response?.data?.detail || `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, title]);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="page-stack feature-workspace">
      <section className="page-heading">
        <div>
          <p className="eyebrow">PEOPLEFIRST HRMS</p>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </div>
        <button className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </section>
      <section className="feature-summary">
        <div className="feature-summary-icon"><FileText size={22} /></div>
        <div><span>Total records</span><strong>{loading ? "—" : rows.length}</strong></div>
      </section>
      <section className="content-card">
        <div className="section-heading feature-table-heading">
          <div><h2>{title} records</h2><p className="muted">Connected to the HRMS backend</p></div>
          <label className="feature-search">
            <Search size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records..." aria-label={`Search ${title}`} />
          </label>
        </div>
        {error && <div className="feature-error" role="alert"><AlertCircle size={18}/><span>{String(error)}</span><button className="secondary-button" onClick={load}>Retry</button></div>}
        {loading ? <div className="feature-empty">Loading {title.toLowerCase()}...</div> :
          !error && filtered.length === 0 ? <div className="feature-empty"><FileText size={28}/><strong>No records found</strong><span>Records will appear here when available.</span></div> :
          !error && <div className="feature-table-scroll"><table className="feature-table"><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{filtered.map((row, i) => <tr key={row.id ?? i}>{columns.map(c => <td key={c.key}>{row[c.key] == null || row[c.key] === "" ? "—" : c.key === "status" ? <span className={`feature-status ${String(row[c.key]).toLowerCase()}`}>{String(row[c.key])}</span> : String(row[c.key])}</td>)}</tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
