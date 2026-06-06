#!/bin/bash
# promote-staging-to-production.sh — Promote staging to production (REQUIRES CONFIRMATION)
# Usage: CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh [version]
# Example: CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0

set -euo pipefail

# Safety check
if [ "${CONFIRM_PRODUCTION_PROMOTION:-}" != "yes" ]; then
    echo "🛑 PRODUCTION PROMOTION REQUIRES EXPLICIT CONFIRMATION"
    echo ""
    echo "Usage:"
    echo "  CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh [version]"
    echo ""
    echo "Example:"
    echo "  CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh v0.2.0"
    echo ""
    exit 1
fi

VERSION="${1:-}"

echo "🚀🚀🚀 PROMOTING STAGING TO PRODUCTION 🚀🚀🚀"
echo ""

# Check working tree
if ! git diff-index --quiet HEAD --; then
    echo "❌ Working tree is dirty. Commit or stash changes first."
    exit 1
fi

echo "📍 Fetching from origin..."
git fetch origin --prune --quiet

echo "📍 Checking out production..."
git checkout production --quiet

echo "📍 Updating production..."
if ! git pull --ff-only origin production --quiet; then
    echo "❌ Cannot fast-forward production. History diverged."
    exit 1
fi

echo "📍 Merging staging into production..."
if ! git merge --no-ff origin/staging --quiet; then
    echo ""
    echo "❌ MERGE CONFLICT"
    echo "Resolve manually:"
    echo "  git add ."
    echo "  git commit"
    echo "  git push origin production"
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

if [ $CHECKS_FAILED -gt 0 ]; then
    echo "❌ Some checks failed. Aborting promotion."
    echo "Revert:"
    echo "  git merge --abort"
    exit 1
fi

# Create tag if version provided
if [ -n "$VERSION" ]; then
    echo "📍 Creating tag: $VERSION"
    git tag -a "$VERSION" -m "Release $VERSION" --quiet || true
    echo "✓ Tag created"
fi

echo ""
echo "📍 Pushing production..."
git push origin production --quiet

if [ -n "$VERSION" ]; then
    echo "📍 Pushing tags..."
    git push origin "$VERSION" --quiet
fi

echo ""
echo "✅✅✅ PROMOTED TO PRODUCTION ✅✅✅"
echo ""

if [ -n "$VERSION" ]; then
    echo "Release: $VERSION"
fi

echo "Vercel is deploying production now."
echo ""
echo "Monitor deployment:"
echo "  https://vercel.com/projects/anclora-syncxml/deployments"
echo ""
echo "Next: Monitor logs and production health."
echo ""
