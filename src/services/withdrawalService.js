const API_URL = "http://31.97.228.17:4478";

function getToken() {
  return sessionStorage.getItem("adminToken") || "";
}

function getAuthHeader() {
  const raw = getToken();
  if (!raw) return {};
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}

async function request(url, options = {}) {
  const authHeader = getAuthHeader();

  if (!authHeader.Authorization) {
    throw new Error("No auth token found. Please login again.");
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    // Map common status codes to friendly messages
    let message = data.message;
    if (!message) {
      switch (response.status) {
        case 401:
          message = "Unauthorized. Please login again.";
          break;
        case 403:
          message = "Admin access required.";
          break;
        case 404:
          message = "Withdrawal not found.";
          break;
        case 500:
          message = "Server error. Please try again later.";
          break;
        default:
          message = `Request failed with status ${response.status}`;
      }
    }
    throw new Error(message);
  }

  return data;
}

export const getAllWithdrawals = async () => {
  return request("/api/admin/withdrawals", { method: "GET" });
};

export const getWithdrawalById = async (id) => {
  if (!id) throw new Error("Withdrawal ID is required.");
  return request(`/api/admin/withdrawals/${id}`, { method: "GET" });
};

export const approveWithdrawal = async (id, data = {}) => {
  if (!id) throw new Error("Withdrawal ID is required.");
  return request(`/api/admin/withdrawals/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({
      paymentReference: data.paymentReference?.trim() || "",
      paymentNote: data.paymentNote?.trim() || "",
    }),
  });
};

export const rejectWithdrawal = async (id, data = {}) => {
  if (!id) throw new Error("Withdrawal ID is required.");
  const reason = String(data.rejectionReason || "").trim();
  if (!reason) throw new Error("Rejection reason is required.");
  return request(`/api/admin/withdrawals/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ rejectionReason: reason }),
  });
};