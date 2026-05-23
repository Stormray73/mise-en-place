#!/usr/bin/env bash
# fetch-e2e-report.sh
# Downloads the latest Playwright report artifact from GitHub Actions and
# extracts it into playwright-report/ so an agent can analyse the results.
#
# Usage:
#   ./scripts/fetch-e2e-report.sh              # latest run on current branch
#   ./scripts/fetch-e2e-report.sh --run <id>   # specific run ID
#   ./scripts/fetch-e2e-report.sh --branch main

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
ARTIFACT_NAME="playwright-report"
OUTPUT_DIR="playwright-report"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")"

# ── Argument parsing ──────────────────────────────────────────────────────────
RUN_ID=""
BRANCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --run)    RUN_ID="$2";   shift 2 ;;
    --branch) BRANCH="$2";  shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--run <run-id>] [--branch <branch>]"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── Pre-flight checks ─────────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo "Error: GitHub CLI (gh) is not installed."
  echo "Install it from https://cli.github.com/ then run: gh auth login"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "Error: Not authenticated with GitHub CLI. Run: gh auth login"
  exit 1
fi

echo "Repository: ${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

# ── Resolve run ID ────────────────────────────────────────────────────────────
if [[ -z "$RUN_ID" ]]; then
  echo "Finding latest CI run with artifact '${ARTIFACT_NAME}'..."

  FILTER_ARGS=()
  if [[ -n "$BRANCH" ]]; then
    FILTER_ARGS+=(--branch "$BRANCH")
  fi

  # Get the most recent completed run that uploaded the artifact
  RUN_ID=$(gh run list \
    --workflow "main.yml" \
    --status completed \
    --limit 20 \
    "${FILTER_ARGS[@]}" \
    --json databaseId,conclusion,headBranch \
    --jq 'first(.[] | select(.conclusion != null)) | .databaseId' 2>/dev/null || echo "")

  if [[ -z "$RUN_ID" ]]; then
    echo "Error: Could not find a completed CI run. Try specifying one with --run <id>."
    echo "List recent runs with: gh run list --workflow main.yml"
    exit 1
  fi
fi

echo "Using run ID: ${RUN_ID}"

# ── Download ──────────────────────────────────────────────────────────────────
STAGING_DIR=$(mktemp -d)
trap 'rm -rf "$STAGING_DIR"' EXIT

echo "Downloading artifact '${ARTIFACT_NAME}' from run ${RUN_ID}..."
if ! gh run download "$RUN_ID" \
    --name "$ARTIFACT_NAME" \
    --dir "$STAGING_DIR"; then
  echo ""
  echo "Error: Could not download artifact. Possible reasons:"
  echo "  • The run is still in progress"
  echo "  • The artifact has expired (retention is 30 days)"
  echo "  • The E2E step was skipped on this run"
  echo ""
  echo "List available artifacts with: gh run view ${RUN_ID} --log"
  exit 1
fi

# ── Extract into playwright-report/ ──────────────────────────────────────────
echo "Extracting report to ${OUTPUT_DIR}/..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# gh downloads the artifact contents into a named subdirectory
if [[ -d "$STAGING_DIR/$ARTIFACT_NAME" ]]; then
  cp -r "$STAGING_DIR/$ARTIFACT_NAME/." "$OUTPUT_DIR/"
else
  cp -r "$STAGING_DIR/." "$OUTPUT_DIR/"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "✅ Report ready in: ${OUTPUT_DIR}/"
echo ""
echo "Run summary from GitHub:"
gh run view "$RUN_ID" --json conclusion,headBranch,displayTitle,url \
  --jq '"  Branch:     \(.headBranch)\n  Conclusion: \(.conclusion)\n  Title:      \(.displayTitle)\n  URL:        \(.url)"' \
  2>/dev/null || true
echo ""
echo "Next step: ask the agent to analyse the results."
echo "  e.g. \"Analyse the Playwright report in playwright-report/ and fix any failures.\""
