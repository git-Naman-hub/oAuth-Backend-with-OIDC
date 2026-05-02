#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
KEY_DIR="$ROOT_DIR/keys"
mkdir -p $KEY_DIR

echo "Generating RSA private key..."
openssl genpkey -algorithm RSA -out $KEY_DIR/private.pem -pkeyopt rsa_keygen_bits:2048

echo "Extracting public key..."
openssl rsa -pubout -in $KEY_DIR/private.pem -out $KEY_DIR/public.pem

echo "Keys generated in $KEY_DIR"