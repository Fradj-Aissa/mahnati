export function cleanPocketBaseUrl(raw?: string): string {
  if (!raw || typeof raw !== "string") {
    return "http://127.0.0.1:8090";
  }

  let cleaned = raw.trim().replace(/^["']|["']$/g, "").trim();

  // Remove leading square brackets or parentheses
  cleaned = cleaned.replace(/^[\[\(]+/, "").replace(/[\]\)]+$/, "").trim();

  // If formatted like markdown link [url](target) or url](target)
  if (cleaned.includes("]")) {
    cleaned = cleaned.split("]")[0].trim();
  }
  if (cleaned.includes("(")) {
    cleaned = cleaned.split("(")[0].trim();
  }

  // Fix single slash after http: or https:
  cleaned = cleaned.replace(/^(https?):\/+([^\/])/, "$1://$2");

  // If no protocol was provided, prepend https://
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  // Remove trailing slashes
  return cleaned.replace(/\/+$/, "");
}
