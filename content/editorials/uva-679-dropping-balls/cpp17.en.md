`node` stores the current tree index and `number` the target's local visit number, and both change at each level. An odd number selects `node*2` and ceiling division `(number+1)/2`; an even number selects `node*2+1` and exact halving.

The level loop runs from one while below `depth`, exactly the root-to-leaf edge count. Every case resets the node to one. After the declared test cases, the final `-1` sentinel is consumed and never treated as another depth.
