`languages` is a constant map containing the six exact pairs. `find` performs lookup without inserting an entry for unknown input, and comparison with `end()` cleanly selects `UNKNOWN`.

The case counter is incremented only inside the output statement, after the loop condition has rejected `#`. Token input is sufficient because legal greetings contain no spaces, and end of file naturally ends the same loop.
