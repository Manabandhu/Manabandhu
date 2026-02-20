import { z } from 'zod';

const schema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_AUTH_PROVIDER: z.enum(['mock', 'api']).default('mock'),
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

export const env = schema.parse(process.env);
