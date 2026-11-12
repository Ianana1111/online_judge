#!/usr/bin/env python3
"""在章節某個標題的「前面」插入區塊（:::practice、:::trace、:::anim）。

用法：python3 tools/insert_blocks.py chapters/06-loop.md "## while 迴圈" ":::practice loop-1ton"
同一個區塊已經存在就不會重複插入，所以可以放心重跑。
"""
import sys
from pathlib import Path

path, heading, *blocks = sys.argv[1:]
p = Path(path)
text = p.read_text(encoding="utf-8")
lines = text.split("\n")
idx = next((i for i, l in enumerate(lines) if l.strip() == heading.strip()), None)
if idx is None:
    raise SystemExit(f"{path}：找不到標題 {heading}")
add = []
for b in blocks:
    first = b.split("\n")[0]
    if first in text:
        print(f"已經有了：{first}")
        continue
    if not b.endswith(":::") and first.startswith(":::practice"):
        b += "\n:::"
    add += b.split("\n") + [""]
if add:
    lines[idx:idx] = add
    p.write_text("\n".join(lines), encoding="utf-8")
    print(f"{path}：在「{heading}」前面插入 {len(blocks)} 個區塊")
