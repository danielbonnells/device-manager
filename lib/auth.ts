export async function exchangeGoogleCodeForSession(codeResponse: any) {
  const res = await fetch("http://localhost:5231/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(codeResponse),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to authenticate with Google");
  return res.json();
}
