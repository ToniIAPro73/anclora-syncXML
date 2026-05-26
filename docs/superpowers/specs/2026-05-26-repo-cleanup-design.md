# Design Spec: Repository Cleanup (anclora-syncXML)

**Date:** 2026-05-26
**Topic:** repo-cleanup

## Overview
Synchronize the local `main` branch with the remote `origin/main` and delete the redundant feature branch `feat/syncxml-phased-hardening` which has already been merged.

## Research Findings
- `origin/main` contains the merge commit `6ccd56c` which includes all changes from `feat/syncxml-phased-hardening`.
- Local `main` is currently behind `origin/main`.
- `feat/syncxml-phased-hardening` is the only other branch in the repository.

## Design
The cleanup will follow these sequential steps:

1. **Switch to main:** Ensure we are on the primary branch.
   - Command: `git checkout main`
2. **Synchronize main:** Bring local `main` up to date with the remote.
   - Command: `git pull origin main`
3. **Delete local feature branch:** Remove the branch once it's confirmed as merged.
   - Command: `git branch -d feat/syncxml-phased-hardening`
4. **Delete remote feature branch:** Clean up the remote repository.
   - Command: `git push origin --delete feat/syncxml-phased-hardening`

## Success Criteria
- Only the `main` branch exists locally and remotely (excluding HEAD/origin pointers).
- Local `main` is at the same commit as `origin/main`.
- Working directory is clean.
