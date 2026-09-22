Every response consists of two words, so reading `first` and `second` is sufficient. The two explicit branches recognize `too high` and `too low`; the remaining legal response is `right on`.

Using `min` and `max` makes the feasible interval monotone: it can only shrink. Because the stored bounds are inclusive allowed integers, the final membership check includes equality at both ends.

After printing the verdict, the code restores one through ten for the next game. A zero guess exits before any response words are read.
