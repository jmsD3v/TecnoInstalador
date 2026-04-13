import { z } from 'zod'

export const subscribeSchema = z.object({
  plan: z.enum(['PRO', 'PREMIUM']),
  period: z.enum(['monthly', 'annual']),
})

export const cancelSchema = z.object({
  subscriptionId: z.string().min(1),
})

export const adminToggleActiveSchema = z.object({
  is_active: z.boolean(),
})

export const adminTogglePublicSchema = z.object({
  is_public: z.boolean(),
})

export const reviewInviteSchema = z.object({
  client_name: z.string().min(1).max(100).optional(),
  client_email: z.string().email().optional(),
  client_phone: z.string().max(20).optional(),
}).refine(data => data.client_email || data.client_phone, {
  message: 'Email o teléfono requerido',
})

export const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8).max(128),
})
