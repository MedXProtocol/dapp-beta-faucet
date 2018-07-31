#! /bin/sh
mkdir -p .ganache
ganache-cli --noVMErrorsOnRPCResponse=true --db .ganache -i 1234 -e 100000000000 -a 10 -u 0 -m "$HDWALLET_MNEMONIC"
