#!/usr/bin/env python3
"""把 :::anim（觀念動畫）插到各章對應小節的後面（也就是下一個標題的前面）。可以放心重跑。

用法：python3 tools/add_anims.py [--content=<learning_map>]
"""
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent


def content_dir():
    """內容資料夾：--content=<learning_map 資料夾>、環境變數 LEARN_C_CONTENT，或這個工具的上一層。"""
    for a in sys.argv[1:]:
        if a.startswith("--content="):
            return Path(a[len("--content="):]).resolve()
    return Path(os.environ.get("LEARN_C_CONTENT") or Path(__file__).resolve().parent.parent)


CONTENT = content_dir()

# （章節檔, 插在哪個標題前面, 動畫名稱）
ANIMS = [
    ("01-basics.md", "## 註解", "compile-pipeline"),
    ("02-types.md", "## 常用的資料型態", "memory-boxes"),
    ("02-types.md", "## unsigned：沒有負數的整數", "int-overflow"),
    ("03-io.md", "### 跳脫字元", "printf-format"),
    ("03-io.md", "## 四種常見的輸入格式", "scanf-buffer"),
    ("04-operators.md", "## 賦值與複合賦值", "div-mod"),
    ("04-operators.md", "## 賦值與複合賦值", "digit-split"),
    ("04-operators.md", "## 優先順序", "short-circuit"),
    ("05-if.md", "## 大括號要不要寫？", "else-if-flow"),
    ("06-loop.md", "### 迴圈跑幾次？", "for-order"),
    ("06-loop.md", "## 印圖形的三步驟", "nested-clock"),
    ("07-array.md", "## 初始化", "array-address"),
    ("07-array.md", "### 3. 預先建表", "tally-table"),
    ("08-2darray.md", "## 初始化", "row-major"),
    ("08-2darray.md", "## VLA：變長陣列", "magic-square"),
    ("09-char.md", "## `'7'`、`\"7\"`、`7` 不一樣", "ascii-shift"),
    ("10-string.md", "## 用字串存「很大的數字」", "strlen-scan"),
    ("11-function.md", "## 作用範圍（scope）", "call-stack"),
    ("11-function.md", "## 在題目中出現", "recursion"),
    ("12-pointer.md", "## 回答「為什麼 scanf 要寫 &」", "pointer-arrow"),
    ("13-techniques.md", "## 技巧 2：試除法", "to-binary"),
    ("13-techniques.md", "## 技巧 7：數學性質化繁為簡", "greedy-fib"),
    ("13-techniques.md", "## 技巧 9：觀察圖形的規律", "cola-sim"),
]


def main():
    for ch, heading, name in ANIMS:
        r = subprocess.run(["python3", str(HERE / "tools" / "insert_blocks.py"), str(CONTENT / "chapters" / ch), heading, f":::anim {name}\n:::"],
                           capture_output=True, text=True)
        print((r.stdout or r.stderr).strip().replace(str(CONTENT) + "/", ""))


if __name__ == "__main__":
    main()
