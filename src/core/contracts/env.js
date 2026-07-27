import { z } from 'zod';

export const AppEnvSchema = z
  .object({
    VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL debe ser una URL valida'),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY es requerida').optional(),
    VITE_SUPABASE_KEY: z.string().min(1, 'VITE_SUPABASE_KEY es requerida').optional()
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
