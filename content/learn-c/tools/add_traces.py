#!/usr/bin/env python3
"""把各章的 :::trace（逐步執行）插到對應小節的前面。已經有的不會重複插入，可以放心重跑。

用法：python3 tools/add_traces.py [--content=<learning_map>]
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
F = "```"


def trace(title, code, inp=None):
    b = f":::trace {title}\n{F}c\n{code.strip()}\n{F}\n"
    if inp is not None:
        b += f"{F}input\n{inp.strip()}\n{F}\n"
    return b + ":::"


# （章節檔, 插在哪個標題前面, 標題, 程式, 輸入）
TRACES = [
    ("01-basics.md", "## 從程式碼到執行：編譯", "Hello world：程式從 main 的第一行開始，一行一行往下執行", r'''
#include <stdio.h>

int main() {
    printf("Hello, world!\n");
    printf("我會寫 C 了\n");
    return 0;
}''', None),
    ("05-if.md", "## 大括號要不要寫？", "else if：由上往下檢查，第一個成立的就執行，其他的跳過", r'''
#include <stdio.h>

int main() {
    int score;
    scanf("%d", &score);
    if (score >= 90) {
        printf("A\n");
    } else if (score >= 80) {
        printf("B\n");
    } else if (score >= 70) {
        printf("C\n");
    } else {
        printf("F\n");
    }
    return 0;
}''', "85"),
    ("06-loop.md", "### 迴圈跑幾次？", "for 迴圈的執行順序：初始化 → 檢查條件 → 本體 → 更新 → 檢查條件…", r'''
#include <stdio.h>

int main() {
    int sum = 0;
    for (int k = 0; k < 3; k++) {
        printf("k = %d\n", k);
        sum = sum + k;
    }
    printf("sum = %d\n", sum);
    return 0;
}''', None),
    ("06-loop.md", "## do-while", "while：不知道要跑幾次，只知道什麼時候停（數一個數有幾位）", r'''
#include <stdio.h>

int main() {
    int n, digits = 0;
    scanf("%d", &n);
    while (n > 0) {
        n = n / 10;
        digits++;
    }
    printf("%d\n", digits);
    return 0;
}''', "4096"),
    ("06-loop.md", "## 巢狀迴圈", "break 直接離開迴圈；continue 跳過這一圈剩下的部分", r'''
#include <stdio.h>

int main() {
    for (int i = 1; i <= 6; i++) {
        if (i % 2 == 0) {
            continue;
        }
        if (i == 5) {
            break;
        }
        printf("%d\n", i);
    }
    return 0;
}''', None),
    ("06-loop.md", "## 印圖形的三步驟", "巢狀迴圈印三角形：外層每跑一圈，內層從頭跑完一輪", r'''
#include <stdio.h>

int main() {
    int n = 3;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}''', None),
    ("07-array.md", "## 陣列的限制", "倒著印陣列：注意 i 從 n - 1 開始", r'''
#include <stdio.h>

int main() {
    int a[5];
    int n = 4;
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = n - 1; i >= 0; i--) {
        printf("%d ", a[i]);
    }
    printf("\n");
    return 0;
}''', "10 20 30 40"),
    ("10-string.md", "## 用字串存「很大的數字」", "自己寫 strlen：從第 0 格一直走，走到 '\\0' 停下來", r'''
#include <stdio.h>

int myStrlen(char s[]) {
    int len = 0;
    while (s[len] != '\0') {
        len++;
    }
    return len;
}

int main() {
    char word[10] = "cat";
    printf("%d\n", myStrlen(word));
    return 0;
}''', None),
    ("11-function.md", "## 函式呼叫在記憶體裡：call stack", "傳值呼叫：addOne 改的是自己的複本，main 的 x 不會變", r'''
#include <stdio.h>

void addOne(int x) {
    x = x + 1;
    printf("addOne 裡的 x = %d\n", x);
}

int main() {
    int x = 5;
    addOne(x);
    printf("main 裡的 x = %d\n", x);
    return 0;
}''', None),
    ("11-function.md", "## 在題目中出現", "遞迴的 gcd：每呼叫一次就疊上一層，遇到 b == 0 才一層一層回傳", r'''
#include <stdio.h>

int gcd(int a, int b) {
    if (b == 0) {
        return a;
    }
    return gcd(b, a % b);
}

int main() {
    printf("%d\n", gcd(48, 18));
    return 0;
}''', None),
    ("12-pointer.md", "## 陣列名稱就是位址", "用指標寫 swap：函式拿到位址，就能改到 main 的變數", r'''
#include <stdio.h>

void swap(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}

int main() {
    int a = 3, b = 5;
    swap(&a, &b);
    printf("%d %d\n", a, b);
    return 0;
}''', None),
    ("13-techniques.md", "## 技巧 3：打勾表 / 計數表", "試除法：從 2 開始試，能整除就一直除", r'''
#include <stdio.h>

int main() {
    int n = 60;
    for (int p = 2; p <= n / p; p++) {
        while (n % p == 0) {
            printf("%d ", p);
            n = n / p;
        }
    }
    if (n > 1) {
        printf("%d", n);
    }
    printf("\n");
    return 0;
}''', None),
]


def main():
    for ch, heading, title, code, inp in TRACES:
        r = subprocess.run(["python3", str(HERE / "tools" / "insert_blocks.py"), str(CONTENT / "chapters" / ch), heading, trace(title, code, inp)],
                           capture_output=True, text=True)
        print((r.stdout or r.stderr).strip())


if __name__ == "__main__":
    main()
