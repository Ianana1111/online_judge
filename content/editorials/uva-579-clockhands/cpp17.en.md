The colon is consumed into a `char`, so one- or two-digit hours still parse as integers. `hour % 12` maps twelve to the zero-angle position only after the separate sentinel condition is evaluated.

`twiceAngle` stores half-degree units. Its absolute raw difference is compared with the 720-unit complement, keeping the result at most 360 units. Division by `2.0` preserves fractional output, while `fixed` and `setprecision(3)` guarantee exactly three decimal places.
