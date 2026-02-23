import { WEB_API_BASE_URL } from "@/lib/env";

export type BackendStatus = "up" | "down" | "unknown";

export async function getBackendStatus(): Promise<BackendStatus> {
  try {
    const response = await fetch(`${WEB_API_BASE_URL}/actuator/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return "down";
    }

    const payload = (await response.json()) as { status?: string };
    return payload.status?.toUpperCase() === "UP" ? "up" : "down";
  } catch {
    return "unknown";
  }
}
