#!/usr/bin/env bash
# env-pull.sh
# Pulls Vercel env vars and merges them into .env without overwriting
# local-only variables (e.g. DATABASE_URL) that aren't managed by Vercel.

set -euo pipefail

ENV_FILE=".env"
TEMP_FILE=".env.local"

echo "Pulling env vars from Vercel..."
vercel env pull "$TEMP_FILE" --yes

# Ensure .env exists
touch "$ENV_FILE"

# For each key defined in the pulled file, remove that key from .env (if present)
# then append the new value at the end.
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip blank lines and comments
  [[ -z "$line" || "$line" == \#* ]] && continue

  # Extract the key (everything before the first '=')
  key="${line%%=*}"
  [[ -z "$key" ]] && continue

  # Remove existing entry for this key from .env (handles KEY=value and export KEY=value)
  # Use a temp sed file to avoid in-place issues on all platforms
  sed -i "/^[[:space:]]*\(export[[:space:]]\+\)\?${key}[[:space:]]*=.*/d" "$ENV_FILE"
done < "$TEMP_FILE"

# Append all non-blank, non-comment lines from the pulled file
echo "" >> "$ENV_FILE"
echo "# Pulled from Vercel on $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$ENV_FILE"
grep -v '^[[:space:]]*#' "$TEMP_FILE" | grep -v '^[[:space:]]*$' >> "$ENV_FILE"

# Clean up
rm "$TEMP_FILE"

echo "Done. Vercel vars merged into $ENV_FILE."
