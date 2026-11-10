import 'server-only';
import { resolveDeployEnv, resolveMinReview } from '@atlas/curriculum';
import { parseAllowlist } from './signup-policy';

const deployEnv = resolveDeployEnv(process.env.ATLAS_ENV, process.env.NODE_ENV, process.env.VERCEL_ENV);

export const config = {
  deployEnv,
  minReview: resolveMinReview(process.env.ATLAS_CONTENT_MIN_REVIEW, deployEnv),
  secureCookies: process.env.ATLAS_SECURE_COOKIES === 'true' || deployEnv === 'production',
  sessionDays: 14,
  maxTriesPerItem: 3,
  aiEnabled: false as const,
  signupAllowlist: parseAllowlist(process.env.ATLAS_SIGNUP_ALLOWED_EMAILS),
};
