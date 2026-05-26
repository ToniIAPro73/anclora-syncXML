# Repository Cleanup (anclora-syncXML) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize local `main` with `origin/main` and remove the redundant `feat/syncxml-phased-hardening` branch.

**Architecture:** Surgical git operations to switch branches, pull updates, and delete merged branches.

**Tech Stack:** Git CLI

---

### Task 1: Synchronize and Checkout main

**Files:**
- Modify: Current working directory (branch state)

- [ ] **Step 1: Switch to main branch**

```bash
git checkout main
```

- [ ] **Step 2: Verify current status**

```bash
git status
```
Expected: "Your branch is behind 'origin/main' by N commits..."

- [ ] **Step 3: Pull latest changes from remote**

```bash
git pull origin main
```

- [ ] **Step 4: Verify local main is up to date**

```bash
git log -n 1 --oneline
```
Expected: Commit `6ccd56c` (or latest) should be at HEAD.

### Task 2: Delete redundant feature branch

**Files:**
- Modify: Local and remote branch lists

- [ ] **Step 1: Delete local feature branch**

```bash
git branch -d feat/syncxml-phased-hardening
```
Expected: "Deleted branch feat/syncxml-phased-hardening (was eb6ab43)."

- [ ] **Step 2: Delete remote feature branch**

```bash
git push origin --delete feat/syncxml-phased-hardening
```
Expected: " - [deleted]         feat/syncxml-phased-hardening"

- [ ] **Step 3: Verify final state**

```bash
git branch -a
```
Expected: Only `main` and `remotes/origin/main` (plus remotes/origin/HEAD) should remain.
