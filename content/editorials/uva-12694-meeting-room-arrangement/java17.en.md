Sort meetings by increasing finish time. Keep the finish of the last selected meeting, initially zero. Accept a meeting exactly when `start>=end`, increment the count, and replace `end` with its finish.

Finishing earliest leaves at least as much time for every later choice as any other compatible meeting. Starting earliest or having shortest duration does not provide that guarantee.

Choose by earliest finish time, accepting an event only after the previous one ends to leave maximum room.
