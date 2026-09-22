`height`, `climb`, and `fatigue` all use hundredths of a foot, making the simulation exact. The fatigue amount is computed once from the initial climb and does not shrink with `climb`.

`max(0, climb)` floors actual movement at zero while leaving the underlying ability free to keep decreasing. Success breaks before any nightly slide; failure is checked only after that slide. The day counter starts at one, and output strings preserve the required lowercase wording.
