#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

export JEKYLL_ENV="${JEKYLL_ENV:-production}"
export BUNDLE_FROZEN=true

bundle check || bundle install
exec bundle exec jekyll build "$@"
