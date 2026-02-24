// Re-export individual constant modules for backwards compatibility and clarity
export * from "./colors";
export * from "./spacing";
export * from "./typography";
export * from "./api";
export * from "./env";
export * from "./messages";
export * from "./network";
export * from "./websocket";
export * from "./api-messages";
export * from "./api-paths";

export const GRADIENTS = {
  primary: ["#6366F1", "#4F46E5", "#4338CA"] as const,
  primaryShort: ["#6366F1", "#4F46E5"] as const,
};
