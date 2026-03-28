#!/bin/bash
# Usage: .github/scripts/co-commit.sh "commit message" "Co-Author Name" "email@example.com"
MESSAGE="$1"
CO_AUTHOR_NAME="${2:-3h0ll7}"
CO_AUTHOR_EMAIL="${3:-3h0ll7@users.noreply.github.com}"

git commit -m "$MESSAGE

Co-authored-by: $CO_AUTHOR_NAME <$CO_AUTHOR_EMAIL>"
