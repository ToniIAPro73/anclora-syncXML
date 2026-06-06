#!/bin/bash
# merge-agent-branch-to-development.sh — Merge agent branch into development
# Usage: bash scripts/git-flow/merge-agent-branch-to-development.sh <rama>
# Example: bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-mejora-landing

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: bash scripts/git-flow/merge-agent-branch-to-development.sh <rama>"
    echo "Example: bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-mejora-landing"
    exit 1
fi

RAMA="$1"

echo "🔄 Merging $RAMA into development"
echo ""

# Check working tree
if ! git diff-index --quiet HEAD --; then
    echo "❌ Working tree is dirty. Commit or stash changes first."
    exit 1
fi

echo "📍 Fetching from origin..."
git fetch origin --prune --quiet

echo "📍 Switching to development..."
git checkout development --quiet

echo "📍 Updating development..."
if ! git pull --ff-only origin development --quiet; then
    echo "❌ Cannot fast-forward development. History diverged."
    exit 1
fi

echo "📍 Verifying branch exists: origin/$RAMA"
if ! git rev-parse --quiet --verify "origin/$RAMA" > /dev/null; then
    echo "❌ Branch origin/$RAMA not found."
    exit 1
fi

echo "📍 Merging with --no-ff..."
if ! git merge --no-ff "origin/$RAMA" --quiet; then
    echo ""
    echo "❌ MERGE CONFLICT DETECTED"
    echo ""
    echo "Resolve conflicts:"
    echo "  1. Edit conflicted files"
    echo "  2. git add ."
    echo "  3. git commit -m 'chore: resolve merge conflict'"
    echo "  4. git push origin development"
    echo ""
    git status
    exit 1
fi

echo ""
echo "✅ Merge successful"
echo ""

# Run checks
echo "📋 Running checks..."
echo ""

CHECKS_FAILED=0

# Lint
if npm run lint > /dev/null 2>&1; then
    echo "✓ Lint passed"
else
    echo "✗ Lint failed"
    CHECKS_FAILED=1
fi

# TypeScript
if npm run typecheck > /dev/null 2>&1; then
    echo "✓ TypeScript check passed"
else
    echo "✗ TypeScript check failed"
    CHECKS_FAILED=1
fi

# Tests
if npm run test > /dev/null 2>&1; then
    echo "✓ Tests passed"
else
    echo "✗ Tests failed"
    CHECKS_FAILED=1
fi

# Build
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
    echo "📍 Pushing to origin/development..."
    git push origin development --quiet
    echo "✅ Merged and pushed successfully"
    echo ""
else
    echo "❌ Some checks failed. Fix them before pushing."
    echo ""
    echo "Revert merge if needed:"
    echo "  git merge --abort"
    echo ""
    echo "Or fix issues and create new merge commit:"
    echo "  git add ."
    echo "  git commit -m 'chore: fix check failures'"
    exit 1
fi
