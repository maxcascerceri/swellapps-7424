import { ORPCError } from '@orpc/server';
import { and, eq, gte } from 'drizzle-orm';
import { base } from '../__core/app';
import { db } from '../database';
import { advisoryEnquiries } from '../database/schema';
import { advisorySchema } from '../../shared/advisory';

export const advisory = {
  submit: base.input(advisorySchema).handler(async ({ input }) => {
    const existing = await db.select({ id: advisoryEnquiries.id }).from(advisoryEnquiries).where(eq(advisoryEnquiries.id, input.submissionId)).limit(1);
    if (existing.length) return { received: true as const };
    const recent = await db.select({ id: advisoryEnquiries.id }).from(advisoryEnquiries).where(and(eq(advisoryEnquiries.email, input.email), gte(advisoryEnquiries.createdAt, new Date(Date.now() - 60 * 60 * 1000)))).limit(3);
    if (recent.length >= 3) throw new ORPCError('TOO_MANY_REQUESTS', { message: 'A few enquiries have already come through with this email. Please try again later.' });
    const { submissionId, companyFax: _spamField, ...data } = input;
    await db.insert(advisoryEnquiries).values({ ...data, id: submissionId }).onConflictDoNothing();
    return { received: true as const };
  }),
};
