#!/bin/bash
# promote-development-to-staging.sh — Promote development to staging
# Usage: bash scripts/git-flow/promote-development-to-staging.sh

set -euo pipefail

echo "🚀 Promoting development to staging"
echo ""

# Check working tree
if ! git diff-index --quiet HEAD --; then
    echo "❌ Working tree is dirty. Commit or stash changes first."
    exit 1
fi

echo "📍 Fetching from origin..."
git fetch origin --prune --quiet

echo "📍 Checking out staging..."
git checkout staging --quiet

echo "📍 Updating staging..."
if ! git pull --ff-only origin staging --quiet; then
    echo "❌ Cannot fast-forward staging. History diverged."
    exit 1
fi

echo "📍 Merging development into staging..."
if ! git merge --no-ff origin/development --quiet; then
    echo ""
    echo "❌ MERGE CONFLICT"
    echo "Resolve and commit, then push manually:"
    echo "  git add ."
    echo "  git commit"
    echo "  git push origin staging"
    exit 1
fi

echo "✅ Merge successful"
echo ""

# Run checks
echo "📋 Running checks..."

CHECKS_FAILED=0

if npm run lint > /dev/null 2>&1; then
    echo "✓ Lint passed"
else
    echo "✗ Lint failed"
    CHECKS_FAILED=1
fi

if npm run typecheck > /dev/null 2>&1; then
    echo "✓ TypeScript passed"
else
    echo "✗ TypeScript failed"
    CHECKS_FAILED=1
fi

if npm run test > /dev/null 2>&1; then
    echo "✓ Tests passed"
else
    echo "✗ Tests failed"
    CHECKS_FAILED=1
fi

if npm run build > /dev/null 2>&1; then
    echo "✓ Build passed"
else
    echo "✗ Build failed"
    CHECKS_FAILED=1
fi

echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo "✅ All checks passed"
    echo ""
    echo "📍 Pushing staging..."
    git push origin staging --quiet
    echo "✅ Promoted to staging successfully"
    echo ""
    echo "Vercel will deploy staging branch automatically."
    echo ""
    echo "Next step: Validate staging, then promote to production:"
    echo "  CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0"
    echo ""
else
    echo "❌ Some checks failed. Fix them before promoting."
    echo ""
    echo "Revert if needed:"
    echo "  git merge --abort"
    exit 1
fi
