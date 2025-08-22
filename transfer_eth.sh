#!/bin/zsh

# Load environment variables from .env file
source .env

# Usage: Set ETHER_WHALE, AKASH, AMOUNT env vars in .env before running
# Example .env:
# ETHER_WHALE=0x...
# AKASH=0x...
# AMOUNT=1ether
# ./transfer_eth.sh

if [[ -z "$ETHER_WHALE" || -z "$AKASH" || -z "$ETH_AMOUNT" ]]; then
  echo "Error: ETHER_WHALE, AKASH, and ETH_AMOUNT environment variables must be set."
  exit 1
fi

cast rpc anvil_impersonateAccount $ETHER_WHALE
cast send $AKASH --from $ETHER_WHALE --value $ETH_AMOUNT --unlocked
