#!/usr/bin/env bash
#
# Local deploy — the same three steps as .github/workflows/deploy.yml
# (build, sync, invalidate), for when GitHub Actions is unavailable.
#
# Normal path is still: merge to main and let CI deploy. Use this when Actions
# is down or queued, or when you need a deploy to land now.
#
#   npm run deploy                      # only from main
#   DEPLOY_ANY_BRANCH=1 npm run deploy  # override the branch guard
#
set -euo pipefail

BUCKET="s3://killdate.dev"
DISTRIBUTION_ID="EQG7QFC8WUAA4"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

fail() { printf '\033[31merror:\033[0m %s\n' "$1" >&2; exit 1; }
step() { printf '\n\033[36m==>\033[0m %s\n' "$1"; }

command -v aws >/dev/null || fail "aws CLI not found. brew install awscli"
aws sts get-caller-identity >/dev/null 2>&1 || fail "AWS credentials are not valid. Run: aws configure"

# The bucket is the live site. Deploying a feature branch publishes that branch
# to killdate.dev, which is almost never what you want.
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ] && [ "${DEPLOY_ANY_BRANCH:-0}" != "1" ]; then
  fail "on branch '$BRANCH', not main. This publishes to the live site.
       If you really mean it: DEPLOY_ANY_BRANCH=1 npm run deploy"
fi

if [ -n "$(git status --porcelain)" ]; then
  printf '\033[33mwarning:\033[0m working tree is dirty — deploying uncommitted changes.\n'
fi

step "Building ($BRANCH @ $(git rev-parse --short HEAD))"
npm run build

[ -f dist/index.html ] || fail "build produced no dist/index.html"

step "Syncing to $BUCKET"
aws s3 sync dist/ "$BUCKET" --delete

step "Invalidating CloudFront"
INVALIDATION_ID="$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' --output text)"

printf '\n\033[32mDeployed.\033[0m https://killdate.dev\n'
printf 'Invalidation %s — edges typically catch up within a minute.\n' "$INVALIDATION_ID"
printf 'Check: curl -s https://killdate.dev/styles/global.css | head -3\n'
