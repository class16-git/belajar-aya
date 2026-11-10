import { REVIEW_STATUSES, type Lesson, type ReviewStatus } from './schema';

const rank = (s: ReviewStatus) => REVIEW_STATUSES.indexOf(s);

export interface PublicationIssue {
  lessonId: string;
  message: string;
}

/**
 * Publication gate (test scenario 9). Draft content is never publishable. "reviewed"/"published"
 * require a recorded human reviewer; the agent can only set "agent_reviewed".
 */
export function publicationIssues(lesson: Lesson): PublicationIssue[] {
  const issues: PublicationIssue[] = [];
  if (lesson.reviewStatus === 'draft') {
    issues.push({ lessonId: lesson.id, message: 'Draft content cannot be published' });
  }
  if (rank(lesson.reviewStatus) >= rank('reviewed')) {
    const r = lesson.review;
    if (!r.reviewedBy || !r.reviewerRole || !r.reviewedAt) {
      issues.push({
        lessonId: lesson.id,
        message: 'Human review record (reviewedBy, reviewerRole, reviewedAt) is required',
      });
    }
  }
  if (lesson.mode === 'offline' && lesson.safetyNotes.length === 0) {
    issues.push({ lessonId: lesson.id, message: 'Offline cards require safety notes' });
  }
  return issues;
}

/**
 * Deployment environment. A production Node build is treated as real production unless it is
 * explicitly labelled a preview (fake children only, never real learner data).
 */
export function resolveDeployEnv(
  atlasEnv: string | undefined,
  nodeEnv: string | undefined,
  hostEnv?: string | undefined,
): 'production' | 'preview' | 'development' {
  // A trusted platform signal (Vercel's VERCEL_ENV) overrides the label: production always fails closed.
  if (hostEnv === 'production') return 'production';
  if (atlasEnv === 'preview' || atlasEnv === 'development' || atlasEnv === 'production') return atlasEnv;
  return nodeEnv === 'production' ? 'production' : 'development';
}

/**
 * Resolve the minimum review status shown to children. Production can never go below "reviewed",
 * whatever the environment variable says.
 */
export function resolveMinReview(
  envValue: string | undefined,
  deployEnv: string | undefined,
): ReviewStatus {
  const requested = (REVIEW_STATUSES as readonly string[]).includes(envValue ?? '')
    ? (envValue as ReviewStatus)
    : 'reviewed';
  const floor: ReviewStatus = deployEnv === 'production' ? 'reviewed' : 'agent_reviewed';
  return rank(requested) < rank(floor) ? floor : requested;
}

export function isVisible(lesson: Lesson, minReview: ReviewStatus): boolean {
  return publicationIssues(lesson).length === 0 && rank(lesson.reviewStatus) >= rank(minReview);
}
