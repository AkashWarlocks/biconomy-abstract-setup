#!/bin/zsh

# Load environment variables from .env file
source .env

# Usage: Set USDC, WHALE, AKASH, AMOUNT env vars in .env before running
# Example .env:
# USDC=0x...
# WHALE=0x...
# AKASH=0x...
# AMOUNT=30000
# ./transfer_usdc.sh

if [[ -z "$USDC" || -z "$USDC_WHALE" || -z "$AKASH" || -z "$AMOUNT" ]]; then
  echo "Error: USDC, USDC_WHALE, AKASH, and AMOUNT environment variables must be set."
  exit 1
fi
cast rpc anvil_impersonateAccount $USDC_WHALE
cast send $USDC \
  --from $USDC_WHALE \
  --unlocked \
  "transfer(address,uint256)(bool)" \
  $AKASH \
  $AMOUNT
