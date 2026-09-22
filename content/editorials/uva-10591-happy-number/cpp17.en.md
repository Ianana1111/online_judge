`nextValue` repeatedly extracts the last digit with `% 10`, adds its square, and removes it with `/= 10`. Both the input bound and the much smaller transformed values fit safely in `int`.

`original` is kept unchanged for output, while `value` drives the simulation. A fresh `seen` set is created inside every test case.

The loop conditions separately detect success at one and failure at a repeated state. Inserting before transformation ensures that returning to the current value is recognized on the next condition check. The final equality test selects the exact required Happy or Unhappy sentence and the one-based case number.
