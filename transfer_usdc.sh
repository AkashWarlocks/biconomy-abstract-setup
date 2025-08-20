#!/bin/zsh

# Usage: Set USDC, WHALE, AKASH, AMOUNT env vars before running
# Example:
# export USDC=0x...; export WHALE=0x...; export AKASH=0x...; export AMOUNT=30000
# ./transfer_usdc.sh

if [[ -z "$USDC" || -z "$WHALE" || -z "$AKASH" || -z "$AMOUNT" ]]; then
  echo "Error: USDC, WHALE, AKASH, and AMOUNT environment variables must be set."
  exit 1
fi

cast send $USDC \
  --from $WHALE \
  --unlocked \
  "transfer(address,uint256)(bool)" \
  $AKASH \
  $AMOUNT
