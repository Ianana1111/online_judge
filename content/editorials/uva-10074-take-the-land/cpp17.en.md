`clear` is initialized once per top row and persists as bottom expands, so an earlier tree remains disqualifying. `current` is reset for each new bottom because it measures horizontal width under that particular height.

The new row is ANDed into `clear` before scanning its truth value. A blocked column resets `current`; area uses `bottom-top+1` for inclusive height. Starting the answer at zero naturally handles a fully blocked matrix.
