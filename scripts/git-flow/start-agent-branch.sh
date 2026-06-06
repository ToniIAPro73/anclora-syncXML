#!/bin/bash
# start-agent-branch.sh — Create new agent feature branch
# Usage: bash scripts/git-flow/start-agent-branch.sh <agente> <descripción>
# Example: bash scripts/git-flow/start-agent-branch.sh codex mejora-landing

set -euo pipefail

if [ $# -lt 2 ]; then
    echo "Usage: bash scripts/git-flow/start-agent-branch.sh <agente> <descripción>"
    echo "Example: bash scripts/git-flow/start-agent-branch.sh codex mejora-landing"
    exit 1
fi

AGENTE="$1"
DESCRIPCION="$2"
BRANCH_NAME="feat/${AGENTE}-${DESCRIPCION}"

echo "🔄 Starting agent branch: $BRANCH_NAME"
echo ""

# Check working tree
if ! git diff-index --quiet HEAD --; then
    echo "❌ Working tree is dirty. Commit or stash changes first."
    echo "   git status"
    exit 1
fi

echo "📍 Fetching latest from origin..."
git fetch origin --quiet

echo "📍 Switching to development..."
git checkout development --quiet

echo "📍 Updating development..."
if ! git pull --ff-only origin development --quiet; then
    echo "❌ Cannot fast-forward development. History diverged."
    echo "   Run: git log --oneline --graph --all"
    exit 1
fi

echo "📍 Creating branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME" --quiet

echo ""
echo "✅ Branch created: $BRANCH_NAME"
echo ""
echo "Next steps:"
echo "  1. Make changes"
echo "  2. git add ."
echo "  3. git commit -m 'feat(scope): description'"
echo "  4. git push -u origin $BRANCH_NAME"
echo ""
echo "After pushing, Toni can integrate with:"
echo "  bash scripts/git-flow/merge-agent-branch-to-development.sh $BRANCH_NAME"
echo ""
