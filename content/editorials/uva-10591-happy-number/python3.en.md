The transition is deterministic: the same current value always produces the same next value. Therefore, before reaching one, seeing any value a second time proves that all future values will repeat the same cycle.

For each test, maintain a set `seen`. While the current value is neither one nor already present, insert it and compute the next digit-square sum. When the loop ends, classify it as happy exactly when the current value is one.

Termination is guaranteed. The input has at most nine digits, so after one step the value is at most `9*9^2=729`; the subsequent deterministic sequence moves within a finite state set and must reach one or repeat.

Reaching one succeeds; repeating any non-one state means the same cycle will continue forever.
