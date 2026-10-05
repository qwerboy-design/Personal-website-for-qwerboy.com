#!/usr/bin/env bash

set -euo pipefail

DOMAIN="${1:-qwerboy.com}"
WWW_DOMAIN="www.${DOMAIN}"
GITHUB_PAGES_HOST="${GITHUB_PAGES_HOST:-qwerboy-design.github.io}"
GITHUB_PAGES_IPS=(
  "185.199.108.153"
  "185.199.109.153"
  "185.199.110.153"
  "185.199.111.153"
)

say() {
  printf '%s\n' "$*"
}

check_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    say "Missing required command: $1"
    exit 1
  fi
}

curl_head() {
  local url="$1"
  curl -I -L --max-time 15 "$url" 2>&1 | sed -n '1,20p'
}

curl_bypass() {
  local ip="$1"
  curl -k -I --resolve "${DOMAIN}:443:${ip}" "https://${DOMAIN}/" 2>&1 | sed -n '1,18p'
}

check_command dig
check_command curl

ns_records=()
while IFS= read -r line; do
  [[ -n "${line}" ]] && ns_records+=("${line}")
done < <(dig +short "${DOMAIN}" NS)

say "== Domain =="
say "${DOMAIN}"
say

say "== Nameservers =="
if ((${#ns_records[@]} == 0)); then
  say "No NS records returned."
  exit 1
fi
printf '%s\n' "${ns_records[@]}"
say

say "== Authoritative DNS =="
for ns in "${ns_records[@]}"; do
  say "-- ${ns}"
  dig "@${ns}" "${DOMAIN}" A +noall +answer
done
say

say "== WWW Alias =="
dig "@${ns_records[0]}" "${WWW_DOMAIN}" CNAME +noall +answer
say

say "== Public HTTPS =="
say "-- https://${DOMAIN}"
curl_head "https://${DOMAIN}" || true
say
say "-- https://${WWW_DOMAIN}"
curl_head "https://${WWW_DOMAIN}" || true
say

say "== GitHub Pages Bypass =="
for ip in "${GITHUB_PAGES_IPS[@]}"; do
  say "-- ${ip}"
  curl_bypass "${ip}" || true
  say
done

say "== Expected Cloudflare Records =="
cat <<EOF
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  ${GITHUB_PAGES_HOST}
EOF
