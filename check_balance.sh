#!/bin/zsh

# Usage: ./check_balance.sh <ACCOUNT_ADDRESS>
# Example: ./check_balance.sh 0x123...

if [[ -z "$1" ]]; then
  echo "Usage: $0 <ACCOUNT_ADDRESS>"
  exit 1
fi

ACCOUNT=$1

# Show ETH balance
echo "ETH Balance for $ACCOUNT:"
cast balance $ACCOUNT

# Show USDC balance (requires USDC env var)
if [[ -z "$USDC" ]]; then
  echo "USDC contract address not set. Please export USDC=<usdc_contract_address>"
else
  echo "USDC Balance for $ACCOUNT:"
  cast call $USDC "balanceOf(address)(uint256)" $ACCOUNT
fi
