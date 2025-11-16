// utils/forms.ts
export type FieldError = { field?: string; message?: string; status?: number };

export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    credentials: "include", // rely on cookie + CORS config if necessary
    ...init,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw {
      field: "form",
      message: "Invalid server response",
      status: res.status,
    };
  }

  if (!res.ok) {
    // backend returns { success:false, field, message }
    if (json && typeof json === "object" && (json.field || json.message)) {
      throw {
        field: json.field || "form",
        message: json.message || "Error",
        status: res.status,
      };
    }
    throw {
      field: "form",
      message: json.message || "Request failed",
      status: res.status,
    };
  }

  return json;
}
