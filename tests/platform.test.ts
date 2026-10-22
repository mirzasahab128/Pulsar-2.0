// Phases 1–3 platform tests (Phoenix line).
//
// Pure-function coverage for server/platform.ts: seed plans, master-admin
// guardrails, signup/ensure flow, feature + limit gate decisions, and the
// dashboard aggregation. OWNER_EMAILS is set to a throwaway address BEFORE
// importing the modules under test (same pattern as security-phase0.test.ts).
process.env.OWNER_EMAILS = 'owner-test@example.com';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const platform = await import('../server/platform.js');
const {
  FEATURE_KEYS,
  getSeedPlans,
  emptyPlatformState,
  effectiveMasterAdmins,
  isMasterAdminEmail,
  validateMasterAdminUpdate,
  ensureUserRecord,
  findUser,
  featureGateDecision,
  limitGateDecision,
  recordUsage,
  currentUsage,
  resolveAccess,
  aggregateDashboardStats
} = platform;

function decoded(overrides: Record<string, any> = {}): any {
  return {
    uid: 'user-1',
    sub: 'user-1',
    email: 'person@example.com',
    email_verified: true,
    iss: 'https://securetoken.google.com/test',
    aud: 'test',
    auth_time: 0,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides
  };
}

describe('seed plans (prompt §3e)', () => {
  it('seeds Trial / Starter / Growth with the specified features and limits', () => {
    const plans = getSeedPlans();
    assert.equal(plans.trial.limits.leadsPerMonth, 100);
    assert.equal(plans.trial.limits.seats, 1);
    assert.equal(plans.trial.features.lead_discovery, true);
    assert.equal(plans.trial.features.call_studio, false);
    assert.equal(plans.trial.isDefault, true);

    assert.equal(plans.starter.limits.leadsPerMonth, 1000);
    assert.equal(plans.starter.limits.seats, 3);
    assert.equal(plans.starter.features.campaigns, true);
    assert.equal(plans.starter.features.email_outreach, true);
    assert.equal(plans.starter.features.daily_briefing, true);
    assert.equal(plans.starter.features.call_studio, false);

    assert.equal(plans.growth.limits.leadsPerMonth, 5000);
    assert.equal(plans.growth.limits.seats, 10);
    for (const key of FEATURE_KEYS) {
      assert.equal(plans.growth.features[key], true, `growth should include ${key}`);
    }
  });
});

describe('master admins (prompt §3b, Phase 0 C7)', () => {
  it('effective set is env ∪ stored, fail-closed when both are empty', () => {
    const state = emptyPlatformState();
    assert.deepEqual(effectiveMasterAdmins(state, []), []);
    assert.deepEqual(effectiveMasterAdmins(state, ['a@example.com']), ['a@example.com']);
    state.masterAdminEmails = ['b@example.com'];
    assert.deepEqual(
      effectiveMasterAdmins(state, ['a@example.com']).sort(),
      ['a@example.com', 'b@example.com']
    );
    assert.equal(isMasterAdminEmail(state, 'B@Example.com', ['a@example.com']), true);
    assert.equal(isMasterAdminEmail(state, 'nobody@example.com', []), false);
  });

  it('guardrail: removing yourself returns 409', () => {
    const state = emptyPlatformState();
    state.masterAdminEmails = ['second@example.com'];
    const verdict = validateMasterAdminUpdate(state, 'second@example.com', [], ['owner@example.com']);
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.equal(verdict.status, 409);
  });

  it('guardrail: removing the last master admin returns 409', () => {
    const state = emptyPlatformState();
    state.masterAdminEmails = ['only@example.com'];
    const verdict = validateMasterAdminUpdate(state, 'someone-else@example.com', [], []);
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.equal(verdict.status, 409);
  });

  it('a normal update passes', () => {
    const state = emptyPlatformState();
    const verdict = validateMasterAdminUpdate(state, 'owner-test@example.com', ['new@example.com']);
    assert.equal(verdict.ok, true);
  });
});

describe('ensureUserRecord (prompt §3a)', () => {
  it('a fresh self-signup lands in pending_approval with no plan', () => {
    const state = emptyPlatformState();
    const { user, created } = ensureUserRecord(state, { uid: 'u-new', email: 'new@example.com', name: 'New' });
    assert.equal(created, true);
    assert.equal(user.status, 'pending_approval');
    assert.equal(user.planId, null);
    assert.equal(user.role, 'user');
  });

  it('an env owner becomes master_admin + active', () => {
    const state = emptyPlatformState();
    const { user } = ensureUserRecord(state, { uid: 'u-owner', email: 'owner-test@example.com' });
    assert.equal(user.role, 'master_admin');
    assert.equal(user.status, 'active');
  });

  it('an admin-created (invited) record is adopted by email on first sign-in', () => {
    const state = emptyPlatformState();
    state.users['invite:abc'] = {
      uid: 'invite:abc',
      email: 'invited@example.com',
      displayName: 'Invited',
      role: 'user',
      planId: 'growth',
      status: 'active',
      createdAt: new Date().toISOString(),
      invitedBy: 'owner-test@example.com'
    };
    const { user, created } = ensureUserRecord(state, { uid: 'real-uid-1', email: 'invited@example.com' });
    assert.equal(created, false);
    assert.equal(user.uid, 'real-uid-1');
    assert.equal(user.planId, 'growth');
    assert.equal(user.status, 'active');
    assert.equal(state.users['invite:abc'], undefined);
    assert.equal(findUser(state, 'real-uid-1')?.email, 'invited@example.com');
  });
});

describe('feature + limit gates (prompt §3e)', () => {
  function stateWithUser(planId: string | null, status: string = 'active') {
    const state = emptyPlatformState();
    state.users['user-1'] = {
      uid: 'user-1',
      email: 'person@example.com',
      displayName: 'Person',
      role: 'user',
      planId,
      status: status as any,
      createdAt: new Date().toISOString()
    };
    return state;
  }

  it('users with no platform record are grandfathered (Phase 0 compatibility)', () => {
    const state = emptyPlatformState();
    const verdict = featureGateDecision(state, decoded(), 'call_studio');
    assert.equal(verdict.allow, true);
  });

  it('pending user gets 403 ACCOUNT_NOT_ACTIVE', () => {
    const state = stateWithUser(null, 'pending_approval');
    const verdict = featureGateDecision(state, decoded(), 'npi_search');
    assert.equal(verdict.allow, false);
    if (!verdict.allow) {
      assert.equal(verdict.status, 403);
      assert.equal(verdict.body.error, 'ACCOUNT_NOT_ACTIVE');
    }
  });

  it('disabled user gets 403 ACCOUNT_NOT_ACTIVE', () => {
    const state = stateWithUser('growth', 'disabled');
    const verdict = featureGateDecision(state, decoded(), 'call_studio');
    assert.equal(verdict.allow, false);
    if (!verdict.allow) assert.equal(verdict.body.error, 'ACCOUNT_NOT_ACTIVE');
  });

  it('Trial user calling call_studio gets 403 PLAN_FEATURE_NOT_INCLUDED', () => {
    const state = stateWithUser('trial');
    const verdict = featureGateDecision(state, decoded(), 'call_studio');
    assert.equal(verdict.allow, false);
    if (!verdict.allow) {
      assert.equal(verdict.status, 403);
      assert.equal(verdict.body.error, 'PLAN_FEATURE_NOT_INCLUDED');
      assert.equal(verdict.body.feature, 'call_studio');
    }
  });

  it('Trial user passes lead_discovery; Growth user passes call_studio', () => {
    assert.equal(featureGateDecision(stateWithUser('trial'), decoded(), 'lead_discovery').allow, true);
    assert.equal(featureGateDecision(stateWithUser('growth'), decoded(), 'call_studio').allow, true);
  });

  it('master admin bypasses plan gates', () => {
    const state = stateWithUser('trial');
    const verdict = featureGateDecision(state, decoded({ email: 'owner-test@example.com' }), 'call_studio');
    assert.equal(verdict.allow, true);
  });

  it('limit gate trips at the plan limit with limit + usage in the verdict', () => {
    const state = stateWithUser('trial'); // 100 leads/month
    recordUsage(state, 'user-1', 'leads', 100);
    assert.equal(currentUsage(state, 'user-1').leads, 100);
    const verdict = limitGateDecision(state, decoded(), 'leads');
    assert.equal(verdict.allow, false);
    if (!verdict.allow) {
      assert.equal(verdict.body.error, 'PLAN_LIMIT_REACHED');
      assert.equal(verdict.body.limit, 100);
      assert.equal(verdict.body.usage, 100);
    }
  });

  it('limit gate allows below the limit', () => {
    const state = stateWithUser('trial');
    recordUsage(state, 'user-1', 'leads', 99);
    assert.equal(limitGateDecision(state, decoded(), 'leads').allow, true);
  });

  it('resolveAccess: master admin sees every feature and null limits', () => {
    const state = emptyPlatformState();
    const access = resolveAccess(state, decoded({ email: 'owner-test@example.com' }));
    assert.equal(access.isMasterAdmin, true);
    assert.equal(access.limits, null);
    for (const key of FEATURE_KEYS) assert.equal(access.features[key], true);
  });

  it('resolveAccess: plan-less user sees no features', () => {
    const state = stateWithUser(null, 'pending_approval');
    const access = resolveAccess(state, decoded());
    assert.equal(access.status, 'pending_approval');
    for (const key of FEATURE_KEYS) assert.equal(access.features[key], false);
  });
});

describe('aggregateDashboardStats (prompt Part 2)', () => {
  const now = new Date('2026-10-22T12:00:00.000Z');
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  it('empty snapshot aggregates to honest zeros with zero-filled series', () => {
    const stats = aggregateDashboardStats(null, 7, now);
    assert.equal(stats.kpis.totalLeads.value, 0);
    assert.equal(stats.kpis.callsMade.value, 0);
    assert.equal(stats.leadsOverTime.length, 7);
    assert.ok(stats.leadsOverTime.every(d => d.count === 0));
    assert.ok(stats.funnel.every(f => f.count === 0));
    assert.equal(stats.callActivity.simulated, true);
    assert.equal(stats.callActivity.caption, 'Call Studio sessions');
    assert.equal(stats.snapshotUpdatedAt, null);
  });

  it('dated records drive KPIs, funnel, series, outcomes, and deltas', () => {
    const snapshot: any = {
      workspaceId: 'ws_test',
      updatedAt: iso(now),
      leads: [
        { id: 'l1', status: 'Ready for Call', createdAt: iso(daysAgo(1)) },
        { id: 'l2', status: 'Audit Scheduled', createdAt: iso(daysAgo(2)), lastContacted: iso(daysAgo(1)) },
        { id: 'l3', status: 'Voicemail', createdAt: iso(daysAgo(10)) }, // previous period for 7d
        { id: 'l4', status: 'Ready for Call' } // undated: totals only
      ],
      campaigns: [
        { id: 'c1', name: 'Camp', status: 'running', sent: 40, opened: 25, replied: 7, createdAt: iso(daysAgo(3)) }
      ],
      callSessions: [
        { at: iso(daysAgo(1)), outcome: 'answered' },
        { at: iso(daysAgo(1)), outcome: 'voicemail' },
        { at: iso(daysAgo(9)), outcome: 'answered' }
      ],
      tasks: [
        { id: 't1', dueAt: iso(now), completed: false },
        { id: 't2', dueAt: iso(daysAgo(2)), completed: false },
        { id: 't3', dueAt: iso(daysAgo(1)), completed: true, completedAt: iso(daysAgo(1)) }
      ]
    };
    const stats = aggregateDashboardStats(snapshot, 7, now);
    assert.equal(stats.kpis.totalLeads.value, 4);
    assert.equal(stats.kpis.totalLeads.newInRange, 2);
    assert.equal(stats.kpis.totalLeads.delta, 1); // 2 in range vs 1 in previous period
    assert.equal(stats.kpis.qualifiedLeads.value, 1);
    assert.equal(stats.kpis.meetingsBooked.value, 1);
    assert.equal(stats.kpis.activeCampaigns.value, 1);
    assert.equal(stats.kpis.outreachSent.value, 40);
    assert.equal(stats.kpis.outreachReplies.value, 7);
    assert.equal(stats.kpis.outreachSent.delta, null); // counters are cumulative, not dated
    assert.equal(stats.kpis.callsMade.value, 3);
    assert.equal(stats.kpis.callsMade.newInRange, 2);
    assert.equal(stats.funnel.find(f => f.stage === 'Ready for Call')?.count, 2);
    assert.equal(stats.leadsOverTime.reduce((s, d) => s + d.count, 0), 2);
    const outcomes = Object.fromEntries(stats.callActivity.outcomes.map(o => [o.outcome, o.count]));
    assert.equal(outcomes.answered, 1);
    assert.equal(outcomes.voicemail, 1);
    assert.equal(outcomes.no_answer, 0);
    assert.equal(stats.followUpHealth.dueToday, 1);
    assert.equal(stats.followUpHealth.overdue, 1);
    assert.equal(stats.followUpHealth.completedInRange, 1);
    assert.equal(stats.campaignPerformance[0].sent, 40);
  });

  it('range controls the series length', () => {
    assert.equal(aggregateDashboardStats(null, 30, now).leadsOverTime.length, 30);
    assert.equal(aggregateDashboardStats(null, 90, now).leadsOverTime.length, 90);
  });
});
