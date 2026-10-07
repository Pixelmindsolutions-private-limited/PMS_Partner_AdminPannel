import { useState } from "react";

const BASE_URL = "http://31.97.228.17:4478/api/admin";
const ADD_MONEY_URL = `${BASE_URL}/wallet/add-money`;
const DEDUCT_MONEY_URL = `${BASE_URL}/wallet/deduct-money`;

function getToken() {
  return sessionStorage.getItem("adminToken") || "";
}

function getAuthHeader() {
  const raw = getToken();
  if (!raw) return {};
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}

function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[#075d59] text-white hover:bg-[#064b48]",
    secondary: "bg-white text-[#075d59] border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}



function PageHeader({ title, description, actions = [] }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "primary"}
            onClick={action.onClick}
            className={action.className || ""}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function formatINR(n) {
  const num = Number(n) || 0;
  return `\u20B9${num.toLocaleString("en-IN")}`;
}

function WalletMoney() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("add"); // "add" | "deduct"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();

    if (!userId.trim()) {
      setError("Partner/User ID is required.");
      return;
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const url = mode === "add" ? ADD_MONEY_URL : DEDUCT_MONEY_URL;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          userId: userId.trim(),
          amount: amt,
          description: description.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`
        );
      }

      setResult(data);
      setAmount("");
      setDescription("");
    } catch (err) {
      setError(err.message || "Unable to process request.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setUserId("");
    setAmount("");
    setDescription("");
    setError(null);
    setResult(null);
    setMode("add");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet Money"
        description="Credit or debit partner wallets directly."
        actions={[
          { label: "Reset", variant: "secondary", onClick: reset },
        ]}
      />

      {/* Mode tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "add"
                ? "bg-[#075d59] text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Add Money
          </button>
          <button
            type="button"
            onClick={() => setMode("deduct")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "deduct"
                ? "bg-[#075d59] text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Deduct Money
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-gray-600 md:col-span-2">
            <span>Partner / User ID *</span>
            <input
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Paste MongoDB user _id"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
            />
          </label>

          <label className="space-y-2 text-sm text-gray-600">
            <span>Amount (₹) *</span>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
            />
          </label>

          <label className="space-y-2 text-sm text-gray-600">
            <span>Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                mode === "add"
                  ? "Wallet credit by admin"
                  : "Wallet debit by admin"
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
            />
          </label>

          <div className="md:col-span-2 flex justify-end">
            <Button
              type="submit"
              variant={mode === "add" ? "primary" : "danger"}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : mode === "add"
                  ? "Add Money"
                  : "Deduct Money"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-700">
              {result.message || "Success"}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                  New Wallet Balance
                </p>
                <h3 className="mt-3 text-2xl font-bold text-gray-800">
                  {formatINR(result.wallet)}
                </h3>
              </div>

              {result.transaction && (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Last Transaction
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-gray-700">
                    <div>
                      <span className="font-semibold capitalize">
                        {result.transaction.type}
                      </span>{" "}
                      — {formatINR(result.transaction.amount)}
                    </div>
                    <div className="text-gray-500">
                      {result.transaction.description}
                    </div>
                    {result.transaction.createdAt && (
                      <div className="text-xs text-gray-400">
                        {new Date(
                          result.transaction.createdAt
                        ).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletMoney;