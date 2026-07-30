import { z } from 'zod';

export const AppEnvSchema = z
  .object({
    VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL debe ser una URL valida'),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY es requerida').optional(),
    VITE_SUPABASE_KEY: z.string().min(1, 'VITE_SUPABASE_KEY es requerida').optional(),
    VITE_SENTRY_DSN: z.string().url('VITE_SENTRY_DSN debe ser una URL valida').optional(),
    VITE_SENTRY_ENVIRONMENT: z
      .string()
      .min(1, 'VITE_SENTRY_ENVIRONMENT no puede estar vacia')
      .optional(),
    VITE_SENTRY_ENABLE_DEV: z.enum(['true', 'false']).optional(),
    VITE_GA_MEASUREMENT_ID: z
      .string()
      .regex(/^G-[A-Z0-9]+$/, 'VITE_GA_MEASUREMENT_ID debe tener formato G-XXXXXXXXXX')
      .optional(),
    VITE_GA_ENABLE_DEV: z.enum(['true', 'false']).optional()
  })
  .superRefine((value, ctx) => {
    if (!value.VITE_SUPABASE_KEY && !value.VITE_SUPABASE_ANON_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe existir VITE_SUPABASE_KEY o VITE_SUPABASE_ANON_KEY',
        path: ['VITE_SUPABASE_ANON_KEY']
      });
    }
  });

export function parseAppEnv(rawEnv) {
  return AppEnvSchema.parse(rawEnv);
}
