#!/usr/bin/env python3
"""用 gcc 執行練習的參考解答，把每組測資的期望輸出填進 practice/*.md。

用法：python3 tools/fill_outputs.py [--content=<learning_map>] [練習 id ...]（不給 id 就處理全部）

寫練習題時，測資的輸出可以先隨便寫（例如 ?），執行這支程式後會換成真正的答案，
所以期望輸出一定和 gcc 一致，不需要手算。
"""
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

def content_dir():
    """內容資料夾：--content=<learning_map 資料夾>、環境變數 LEARN_C_CONTENT，或這個工具的上一層。"""
    for a in sys.argv[1:]:
        if a.startswith("--content="):
            return Path(a[len("--content="):]).resolve()
    return Path(os.environ.get("LEARN_C_CONTENT") or Path(__file__).resolve().parent.parent)


PRACTICE = content_dir() / "practice"


def run(binary, data):
    r = subprocess.run([binary], input=data.encode(), capture_output=True, timeout=10)
    if r.returncode != 0:
        raise SystemExit(f"參考解答執行失敗（回傳 {r.returncode}）：輸入 {data!r}")
    return r.stdout.decode()


def fill(path):
    text = path.read_text(encoding="utf-8")
    m = re.search(r"^## solution\s*\n```c\n(.*?)\n```", text, re.S | re.M)
    if not m:
        raise SystemExit(f"{path.name}：找不到 ## solution")
    with tempfile.TemporaryDirectory() as tmp:
        src, binary = Path(tmp) / "s.c", Path(tmp) / "s"
        src.write_text(m.group(1) + "\n", encoding="utf-8")
        cc = subprocess.run(["gcc", "-std=c17", "-Wall", "-Werror", "-o", str(binary), str(src), "-lm"], capture_output=True, text=True)
        if cc.returncode != 0:
            raise SystemExit(f"{path.name}：參考解答編譯失敗\n{cc.stderr}")

        def repl(t):
            body = t.group(1)
            k = 0 if body.startswith("---\n") else body.find("\n---\n") + 1
            if k == 0 and not body.startswith("---\n"):
                raise SystemExit(f"{path.name}：測資少了 --- 分隔線")
            inp = body[: k - 1] if k else ""
            out = run(str(binary), inp + "\n" if inp else "")
            if not out.endswith("\n"):
                out += "\n"
            return "```test\n" + (inp + "\n" if inp else "") + "---\n" + out + "```"

        new = re.sub(r"```test\n(.*?)```", repl, text, flags=re.S)
    path.write_text(new, encoding="utf-8")
    print(f"已更新 {path.name}")


def main():
    ids = [a for a in sys.argv[1:] if not a.startswith("--")]
    files = [PRACTICE / f"{i}.md" for i in ids] if ids else sorted(PRACTICE.glob("*.md"))
    for f in files:
        fill(f)


if __name__ == "__main__":
    main()
