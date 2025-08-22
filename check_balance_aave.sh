#!/bin/zsh
source .env
# Usage: ./check_balance_aave.sh <ACCOUNT_ADDRESS>
# Example: ./check_balance_aave.sh 0x123...

if [[ -z "$1" ]]; then
  echo "Usage: $0 <ACCOUNT_ADDRESS>"
  exit 1
fi

ACCOUNT=$1

# Show AAVE USDC balance (requires AUSDC env var)
if [[ -z "$AUSDC" ]]; then
  echo "aUSDC contract address not set. Please export USDC=<usdc_contract_address>"
else
  echo "aUSDC Balance for $ACCOUNT:"
  cast call $AUSDC "balanceOf(address)(uint256)" $ACCOUNT
fi
