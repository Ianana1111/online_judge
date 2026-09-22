The `winning` vector is initialized false, preserving the zero-stone losing base because the loop starts at one. The condition checks `take<=stones` before indexing `stones-take`, preventing a negative index.

Finding any losing successor sets the state true and breaks; otherwise its default false value remains. Each dataset creates a fresh table because the allowed move set changes. Move sizes use a wider type, and values larger than the current pile are naturally ignored.
