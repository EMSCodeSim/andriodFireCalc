#!/usr/bin/env bash
set -euo pipefail

EXPECTED_SHA256="E8:EF:04:B7:E3:86:C0:84:20:1D:B4:E9:18:9C:C0:8E:D3:07:0D:62:3F:A3:99:F1:96:A3:43:EE:7F:89:EE:5D"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 path/to/app-release.aab" >&2
  exit 2
fi

AAB="$1"
if [[ ! -f "$AAB" ]]; then
  echo "FAIL: AAB not found: $AAB" >&2
  exit 2
fi

for tool in unzip keytool; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "FAIL: required tool not found: $tool" >&2
    exit 2
  fi
done

SIG_ENTRY="$(unzip -Z1 "$AAB" | grep -E '^META-INF/.*\.(RSA|DSA|EC)$' | head -n 1 || true)"
if [[ -z "$SIG_ENTRY" ]]; then
  echo "FAIL: bundle is not JAR-signed; no certificate entry found in META-INF." >&2
  exit 1
fi

TMP_CERT="$(mktemp)"
trap 'rm -f "$TMP_CERT"' EXIT
unzip -p "$AAB" "$SIG_ENTRY" > "$TMP_CERT"

ACTUAL_SHA256="$(keytool -printcert -file "$TMP_CERT" 2>/dev/null | sed -n 's/^[[:space:]]*SHA256:[[:space:]]*//p' | head -n 1)"

if [[ -z "$ACTUAL_SHA256" ]]; then
  echo "FAIL: could not read signing certificate SHA-256 fingerprint." >&2
  exit 1
fi

echo "Expected upload certificate: $EXPECTED_SHA256"
echo "Actual bundle certificate:   $ACTUAL_SHA256"

if [[ "${ACTUAL_SHA256^^}" != "${EXPECTED_SHA256^^}" ]]; then
  echo "FAIL: signing certificate does not match the original FireOps Calc Google Play upload key." >&2
  exit 1
fi

echo "PASS: signed AAB matches the original FireOps Calc Google Play upload certificate."
