`color_mask` lists every legal color explicitly. For example, binary `110` for G consumes yellow and cyan but not magenta, while W has no set bits.

`remaining` preserves input order M,Y,C, and the channel index is both its list position and bit position. The code checks all stock only after processing the picture. Failure prints only `NO`; success expands the exact three remaining integers after `YES` with standard single-space separation.
