import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { chatWithShoppingAssistantAPI } from "../services/api";
import { formatPrice } from "../services/currency";

function ShoppingAssistant() {
  const userId = useSelector((state) => state.auth.user?.id || null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionVersion = useRef(0);

  // This widget stays mounted while users log out and in. Resetting local
  // state here prevents one browser user's search results appearing for the
  // next user, including when an earlier request finishes late.
  useEffect(() => {
    sessionVersion.current += 1;
    setIsOpen(false);
    setMessage("");
    setResult(null);
    setError("");
    setLoading(false);
  }, [userId]);

  const submit = async (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || loading) return;

    setLoading(true);
    setError("");
    const requestSession = sessionVersion.current;
    try {
      const assistantResult = await chatWithShoppingAssistantAPI(question);
      if (requestSession === sessionVersion.current) {
        setResult(assistantResult);
      }
    } catch (requestError) {
      if (requestSession === sessionVersion.current) {
        setError(requestError.message);
      }
    } finally {
      if (requestSession === sessionVersion.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {isOpen && (
        <section className="mb-3 w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-400/30" aria-label="AI shopping assistant">
          <div className="bg-blue-600 px-4 py-3 text-white">
            <h2 className="font-semibold">Shopping assistant</h2>
            <p className="text-xs text-blue-100">Ask about products, categories, price, or stock.</p>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {!result && !error && <p className="text-sm text-slate-600">Try “wireless headphones under $100” or “what is available in Electronics?”</p>}
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {result && (
              <>
                <p className="text-sm text-slate-700">{result.response}</p>
                {!result.aiAvailable && <p className="text-xs text-amber-700">Semantic matching is temporarily unavailable; these are keyword matches from the current catalog.</p>}
                {result.products.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} onClick={() => setIsOpen(false)} className="block rounded-xl border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50">
                    <p className="font-semibold text-slate-800">{product.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{product.category} · {formatPrice(product.price)} · {product.stock} in stock</p>
                  </Link>
                ))}
              </>
            )}
          </div>

          <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3">
            <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength="500" placeholder="What are you looking for?" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Finding…" : "Ask"}</button>
          </form>
        </section>
      )}
      <button onClick={() => setIsOpen((open) => !open)} className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700" aria-expanded={isOpen}>
        {isOpen ? "Close assistant" : "Ask AI"}
      </button>
    </div>
  );
}

export default ShoppingAssistant;
