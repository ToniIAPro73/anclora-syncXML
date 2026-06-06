#!/bin/bash
# status-release-flow.sh — Show release flow status
# Usage: bash scripts/git-flow/status-release-flow.sh

set -euo pipefail

echo "==================================================================="
echo "GIT FLOW STATUS — Anclora SyncXML"
echo "==================================================================="
echo ""

# Current status
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

if git diff-index --quiet HEAD --; then
    echo "   Working tree: CLEAN ✓"
else
    echo "   Working tree: DIRTY ⚠️"
    git status --short | sed 's/^/     /'
fi

echo ""
echo "==================================================================="
echo "BRANCH STATUS"
echo "==================================================================="
echo ""

for branch in production staging development; do
    if git rev-parse --quiet --verify "origin/$branch" > /dev/null 2>&1; then
        echo "📌 $branch (last 3 commits):"
        git log "origin/$branch" --oneline -n 3 --decorate | sed 's/^/   /'
        echo ""
    else
        echo "⚠️  $branch: does not exist on origin"
        echo ""
    fi
done

echo "==================================================================="
echo "COMMITS AHEAD"
echo "==================================================================="
echo ""

# development ahead of staging
if git rev-parse --quiet --verify "origin/development" > /dev/null 2>&1 && \
   git rev-parse --quiet --verify "origin/staging" > /dev/null 2>&1; then
    AHEAD=$(git rev-list --count origin/staging..origin/development 2>/dev/null || echo "0")
    if [ "$AHEAD" -gt 0 ]; then
        echo "✓ development is $AHEAD commit(s) ahead of staging"
        git log origin/staging..origin/development --oneline | sed 's/^/   /'
    else
        echo "✓ development is aligned with staging"
    fi
    echo ""
fi

# staging ahead of production
if git rev-parse --quiet --verify "origin/staging" > /dev/null 2>&1 && \
   git rev-parse --quiet --verify "origin/production" > /dev/null 2>&1; then
    AHEAD=$(git rev-list --count origin/production..origin/staging 2>/dev/null || echo "0")
    if [ "$AHEAD" -gt 0 ]; then
        echo "✓ staging is $AHEAD commit(s) ahead of production"
        git log origin/production..origin/staging --oneline | sed 's/^/   /'
    else
        echo "✓ staging is aligned with production"
    fi
    echo ""
fi

echo "==================================================================="
echo "TAGS"
echo "==================================================================="
echo ""

TAGS=$(git tag -l | sort -V | tail -10 || echo "No tags")
if [ "$TAGS" != "No tags" ]; then
    echo "Recent tags (last 10):"
    echo "$TAGS" | sed 's/^/   /'
else
    echo "No tags found"
fi

echo ""
echo "==================================================================="
echo "Commands:"
echo "  bash scripts/git-flow/start-agent-branch.sh <agente> <descripción>"
echo "  bash scripts/git-flow/merge-agent-branch-to-development.sh <rama>"
echo "  bash scripts/git-flow/promote-development-to-staging.sh"
echo "  CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh [version]"
echo "==================================================================="
echo ""
