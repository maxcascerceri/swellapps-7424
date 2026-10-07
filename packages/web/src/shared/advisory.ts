import { z } from 'zod';

export const stages = ['Pre-launch', 'Launched', 'Growing', 'Established'] as const;
export const revenues = ['Pre-revenue', 'Under $10k', '$10k–$50k', '$50k–$250k', '$250k+', 'Not revenue-driven yet'] as const;
export const helpAreas = ['Growth', 'Marketing', 'Product', 'Monetization', 'Strategy'] as const;

export const advisorySchema = z.object({
  submissionId: z.string().uuid(),
  building: z.string().trim().min(3, 'Give us a quick sentence about your project.').max(250),
  stage: z.enum(stages),
  revenue: z.enum(revenues),
  areas: z.array(z.enum(helpAreas)).min(1).max(helpAreas.length).refine(values => new Set(values).size === values.length),
  challenge: z.string().trim().min(3, 'Tell us the short version.').max(200),
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(254),
  company: z.string().trim().min(1, 'Please enter your company or product name.').max(150),
  website: z.string().trim().max(500).refine(value => {
    if (!value) return true;
    try { const url = new URL(value.includes('://') ? value : `https://${value}`); return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password; } catch { return false; }
  }, 'Please enter a website or app link, or leave it blank.'),
  companyFax: z.string().max(0),
});
export type AdvisoryInput = z.infer<typeof advisorySchema>;
