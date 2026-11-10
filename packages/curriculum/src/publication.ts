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
  issues.push(...religiousIssues(lesson));
  return issues;
}

/** Lessons that need a qualified religious reviewer before anyone may see them. */
export function requiresReligiousReview(lesson: Lesson): boolean {
  return (
    lesson.domain === 'islamic_studies' ||
    lesson.framework === 'islamic_studies' ||
    (lesson.arabicPhrases ?? []).length > 0 ||
    (lesson.reviewFlags ?? []).includes('religious_content')
  );
}

/**
 * Religious gate (Curriculum Bible governance): independent of, and in addition to, the normal review.
 * Approval needs a named scholar reviewer, a review date and — when Arabic is shown — a translation reviewer
 * and every phrase verified. Missing citations are never filled in by the agent.
 */
export function religiousIssues(lesson: Lesson): PublicationIssue[] {
  if (!requiresReligiousReview(lesson)) return [];
  const r = lesson.religiousReview;
  const out: PublicationIssue[] = [];
  if (!r) return [{ lessonId: lesson.id, message: 'Religious review record is required' }];
  if (r.approvalStatus !== 'approved') out.push({ lessonId: lesson.id, message: `Religious review is ${r.approvalStatus}` });
  else {
    if (!r.scholarReviewer || !r.reviewedAt) out.push({ lessonId: lesson.id, message: 'Approved religious review needs scholarReviewer and reviewedAt' });
    if ((lesson.arabicPhrases ?? []).length > 0 && !r.translationReviewer) out.push({ lessonId: lesson.id, message: 'Arabic text needs a translation reviewer' });
  }
  if ((lesson.arabicPhrases ?? []).some((p) => !p.verified)) out.push({ lessonId: lesson.id, message: 'Arabic phrases are not verified' });
  return out;
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
