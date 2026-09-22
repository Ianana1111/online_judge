`capacity=1` and `pastes=0` represent the existing initial line. The inner loop doubles only while capacity is strictly below the target, so equality at a power of two stops without an extra operation.

The outer condition accepts positive cases and rejects any negative sentinel. The case counter advances only when output is produced. No actual strings or copied lines are stored.
