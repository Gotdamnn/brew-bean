import { z } from 'zod';
import { PRODUCTS } from './menu';

export const REVIEW_MIN = 10;
export const REVIEW_MAX = 1000;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const ITEM_NAMES = new Set(PRODUCTS.map((p) => p.name));

export const ReviewInput = z
  .object({
    customerName: z.string().trim().max(60, 'Name is too long').optional().default(''),
    rating: z.coerce.number().int().min(1, 'Please choose a star rating').max(5),
    drinkOrdered: z
      .string()
      .trim()
      .max(80)
      .optional()
      .default('')
      .refine((v) => !v || ITEM_NAMES.has(v), 'Please pick an item from the menu list'),
    reviewText: z
      .string()
      .trim()
      .min(REVIEW_MIN, `Please write at least ${REVIEW_MIN} characters`)
      .max(REVIEW_MAX, `Please keep your review under ${REVIEW_MAX} characters`)
      .refine((v) => (v.match(/\p{L}/gu) || []).length >= 5, 'Please write a few words about your visit'),
    visitDate: z
      .string()
      .optional()
      .default('')
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Invalid date')
      .refine((v) => {
        if (!v) return true;
        const d = new Date(`${v}T00:00:00Z`).getTime();
        const now = Date.now();
        return d <= now + 36 * 3600 * 1000 && d >= now - 400 * 24 * 3600 * 1000;
      }, 'Visit date must be within the last year and not in the future'),
    visibility: z.enum(['public', 'private']),
    consent: z
      .union([z.literal('true'), z.literal('false'), z.boolean()])
      .optional()
      .transform((v) => v === true || v === 'true'),
    website: z.string().max(0).optional().default(''), // honeypot
    startedAt: z.coerce.number().optional(),
  })
  .refine((v) => v.visibility === 'private' || v.consent, {
    message: 'Please tick the box allowing us to publish your review, or choose private feedback.',
    path: ['consent'],
  });

export type ReviewInputT = z.infer<typeof ReviewInput>;
