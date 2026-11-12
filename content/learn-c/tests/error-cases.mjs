// 錯誤訊息測試：常見的錯誤程式，要回報正確的錯誤種類、行號，訊息裡要有關鍵字。
// status：compile / runtime / limit / ok（ok 表示能執行，但要有對應的警告 warn）。
// out：（選填）執行結果必須完全等於這個字串（用來確認「格式不符」時模擬的真實結果）。
export default [
  // ---------- 編譯錯誤 ----------
  { name: '少分號：回報上一行', status: 'compile', line: 3, has: '分號', src: `#include <stdio.h>
int main() {
    int a = 5
    printf("%d\\n", a);
    return 0;
}` },
  { name: '少分號：return 前', status: 'compile', line: 4, has: '分號', src: `#include <stdio.h>
int main() {
    int x = 1;
    printf("%d", x)
    return 0;
}` },
  { name: '未宣告的變數，建議相近的名字', status: 'compile', line: 4, has: ['沒有宣告', 'total'], src: `#include <stdio.h>
int main() {
    int total = 0;
    totl = 5;
    return 0;
}` },
  { name: '沒 include stdio.h 就用 printf', status: 'compile', line: 2, has: 'stdio.h', src: `int main() {
    printf("hi\\n");
    return 0;
}` },
  { name: '沒 include stdio.h 就用 EOF', status: 'compile', line: 3, has: 'stdio.h', src: `int main() {
    int x = 0;
    if (x == EOF) x = 1;
    return 0;
}` },
  { name: '沒 include string.h 就用 strlen', status: 'compile', line: 4, has: 'string.h', src: `#include <stdio.h>
int main() {
    char s[] = "abc";
    printf("%d", (int)strlen(s));
    return 0;
}` },
  { name: 'bool 需要 stdbool.h', status: 'compile', line: 3, has: 'stdbool.h', src: `#include <stdio.h>
int main() {
    bool ok = 1;
    return 0;
}` },
  { name: 'C++ 的標頭檔', status: 'compile', line: 1, has: ['C++', 'stdio.h'], src: `#include <iostream>
int main() { return 0; }` },
  { name: '帶參數的 #define', status: 'compile', line: 2, has: '帶參數的 #define', src: `#include <stdio.h>
#define SQ(x) ((x) * (x))
int main() { return 0; }` },
  { name: '函式寫在 main 後面又沒有原型', status: 'compile', line: 3, has: ['還沒有被宣告', '原型'], src: `#include <stdio.h>
int main() {
    printf("%d\\n", twice(3));
    return 0;
}
int twice(int x) { return x * 2; }` },
  { name: '陣列不能用 = 賦值', status: 'compile', line: 5, has: '陣列不能用 =', src: `#include <stdio.h>
int main() {
    int a[3] = {1, 2, 3};
    int b[3];
    b = a;
    return 0;
}` },
  { name: '字串要用 strcpy', status: 'compile', line: 4, has: 'strcpy', src: `#include <stdio.h>
int main() {
    char s[10];
    s = "abc";
    return 0;
}` },
  { name: '% 用在小數上', status: 'compile', line: 4, has: '% 只能用在整數', src: `#include <stdio.h>
int main() {
    double x = 5.5;
    double r = x % 2;
    return 0;
}` },
  { name: '參數個數不對', status: 'compile', line: 4, has: '需要 2 個參數', src: `#include <stdio.h>
int add(int a, int b) { return a + b; }
int main() {
    int s = add(1, 2, 3);
    return 0;
}` },
  { name: '指標與整數混用', status: 'compile', line: 4, has: '指標', src: `#include <stdio.h>
int main() {
    int x = 5;
    int *p = x;
    return 0;
}` },
  { name: '修改 const', status: 'compile', line: 4, has: 'const', src: `#include <stdio.h>
int main() {
    const int N = 10;
    N = 20;
    return 0;
}` },
  { name: 'VLA 不能有初始值', status: 'compile', line: 5, has: '不能在宣告時給初始值', src: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int a[n] = {0};
    return 0;
}` },
  { name: '找不到 main', status: 'compile', has: 'main', src: `#include <stdio.h>
int mian() { return 0; }` },
  { name: 'struct 暫不支援', status: 'compile', line: 2, has: 'struct', src: `#include <stdio.h>
struct P { int x; };
int main() { return 0; }` },
  { name: '全形分號', status: 'compile', line: 3, has: '全形', src: `#include <stdio.h>
int main() {
    int a = 1；
    return 0;
}` },
  { name: '大括號沒有成對', status: 'compile', line: 2, has: '沒有對應的 }', src: `#include <stdio.h>
int main() {
    if (1) {
        printf("x");
    return 0;
}` },
  { name: '字元常數放中文', status: 'compile', line: 3, has: '中文', src: `#include <stdio.h>
int main() {
    char c = '中';
    return 0;
}` },
  { name: 'void 函式回傳值', status: 'compile', line: 2, has: 'void', src: `#include <stdio.h>
void f() { return 5; }
int main() { f(); return 0; }` },
  { name: 'break 在迴圈外', status: 'compile', line: 3, has: 'break', src: `#include <stdio.h>
int main() {
    break;
    return 0;
}` },

  // ---------- 執行錯誤 ----------
  { name: '讀取沒初始化的變數', status: 'runtime', line: 5, has: ['`sum`', '還沒給值', 'int sum = 0;'], src: `#include <stdio.h>
int main() {
    int sum;
    for (int i = 1; i <= 3; i++) {
        sum = sum + i;
    }
    printf("%d\\n", sum);
    return 0;
}` },
  { name: '陣列越界', status: 'runtime', line: 6, has: ['a[5]', 'a[0]', 'a[4]'], src: `#include <stdio.h>
int main() {
    int a[5] = {1, 2, 3, 4, 5};
    int s = 0;
    for (int i = 0; i <= 5; i++) {
        s += a[i];
    }
    printf("%d\\n", s);
    return 0;
}` },
  { name: '二維陣列越界', status: 'runtime', line: 4, has: ['a[3][0]', '3×3'], src: `#include <stdio.h>
int main() {
    int a[3][3] = {0};
    printf("%d\\n", a[3][0]);
    return 0;
}` },
  { name: '陣列沒有初始化的格子', status: 'runtime', line: 5, has: ['a[2]', '還沒給值'], src: `#include <stdio.h>
int main() {
    int a[5];
    a[0] = 1; a[1] = 2;
    printf("%d\\n", a[0] + a[1] + a[2]);
    return 0;
}` },
  { name: 'scanf 忘了 &', status: 'runtime', line: 4, has: '&n', warn: '忘了 &', src: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", n);
    return 0;
}`, input: '5\n' },
  { name: '除以 0', status: 'runtime', line: 5, has: '除以 0', src: `#include <stdio.h>
int main() {
    int a = 10, b;
    b = 0;
    printf("%d\\n", a / b);
    return 0;
}` },
  { name: '無窮迴圈', status: 'limit', line: 4, has: '無窮迴圈', src: `#include <stdio.h>
int main() {
    int i = 0;
    while (i < 10) {
        printf("");
    }
    return 0;
}` },
  { name: '遞迴沒有終止條件', status: 'runtime', has: '遞迴', src: `#include <stdio.h>
int f(int n) { return f(n + 1) + 1; }
int main() {
    printf("%d\\n", f(0));
    return 0;
}` },
  { name: '修改字串常數', status: 'runtime', line: 4, has: '字串常數不能修改', src: `#include <stdio.h>
int main() {
    char *s = "hello";
    s[0] = 'H';
    return 0;
}` },
  { name: '使用空指標', status: 'runtime', line: 4, has: 'NULL', src: `#include <stdio.h>
int main() {
    int *p = NULL;
    *p = 5;
    return 0;
}` },
  { name: '非 void 函式沒有 return', status: 'runtime', line: 5, has: 'return', src: `#include <stdio.h>
int sign(int x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
}
int main() {
    printf("%d\\n", sign(0));
    return 0;
}` },
  { name: 'scanf %s 讀進太小的陣列', status: 'runtime', line: 4, has: ['只剩 4 格', "'\\0'"], input: 'abcdefgh\n', src: `#include <stdio.h>
int main() {
    char s[4];
    scanf("%s", s);
    return 0;
}` },
  { name: 'strcpy 目標太小', status: 'runtime', line: 5, has: 'strcpy', src: `#include <stdio.h>
#include <string.h>
int main() {
    char s[3];
    strcpy(s, "hello");
    return 0;
}` },
  { name: '字串沒有結尾的 \\0', status: 'runtime', line: 5, has: "'\\0'", src: `#include <stdio.h>
int main() {
    char s[3];
    s[0] = 'a'; s[1] = 'b'; s[2] = 'c';
    printf("%s\\n", s);
    return 0;
}` },

  { name: 'gets 已經被移除', status: 'compile', line: 4, has: 'fgets', src: `#include <stdio.h>
int main() {
    char s[100];
    gets(s);
    return 0;
}` },
  { name: '多了一個右括號', status: 'compile', line: 3, has: '多了一個 )', src: `#include <stdio.h>
int main() {
    printf("hi\\n"));
    return 0;
}` },
  { name: '字元和字串比較', status: 'compile', line: 4, has: '單引號', src: `#include <stdio.h>
int main() {
    char s[5] = "ab";
    if (s[0] == "a") printf("x");
    return 0;
}` },
  { name: '回傳區域變數的位址（懸空指標）', status: 'runtime', line: 5, has: ['懸空指標', 'x'], src: `#include <stdio.h>
int *f() { int x = 5; return &x; }
int main() {
    int *p = f();
    printf("%d\\n", *p);
    return 0;
}` },

  // ---------- 警告（程式仍然會執行） ----------
  { name: '%d 配 long long', status: 'ok', warn: '%lld', out: '1\n', src: `#include <stdio.h>
int main() {
    long long x = 4294967297LL;
    printf("%d\\n", x);
    return 0;
}` },
  { name: '%f 讀 double 只寫 4 bytes', status: 'ok', warn: '%lf', input: '2.5\n', out: 'small\n', src: `#include <stdio.h>
int main() {
    double d = 0;
    scanf("%f", &d);
    if (d < 0.001) printf("small\\n"); else printf("%f\\n", d);
    return 0;
}` },
  { name: '%d 印 double', status: 'ok', warn: '%f', out: '0\n', src: `#include <stdio.h>
int main() {
    double d = 2.0;
    printf("%d\\n", d);
    return 0;
}` },
  { name: '%s 的參數加了 &', status: 'ok', warn: '不需要 &', input: 'hi\n', out: 'hi\n', src: `#include <stdio.h>
int main() {
    char s[10];
    scanf("%s", &s);
    printf("%s\\n", s);
    return 0;
}` },
  { name: 'if 裡用了 =', status: 'ok', warn: '==', out: 'yes\n', src: `#include <stdio.h>
int main() {
    int x = 3;
    if (x = 5) printf("yes\\n");
    return 0;
}` },
  { name: 'for 後面多了分號', status: 'ok', warn: '分號', out: '*\n', src: `#include <stdio.h>
int main() {
    int i;
    for (i = 0; i < 3; i++);
    {
        printf("*\\n");
    }
    return 0;
}` },
  { name: '用 == 比較字串', status: 'ok', warn: 'strcmp', src: `#include <stdio.h>
int main() {
    char a[] = "hi", b[] = "hi";
    if (a == b) printf("same\\n");
    return 0;
}` },
  { name: 'printf 參數不夠', status: 'runtime', warn: '只給了 1 個', has: '沒有對應的值', src: `#include <stdio.h>
int main() {
    printf("%d %d\\n", 1);
    return 0;
}` },
  { name: 'sizeof 陣列參數', status: 'ok', warn: '指標的大小', out: '8\n', src: `#include <stdio.h>
void f(int a[]) { printf("%d\\n", (int)sizeof(a)); }
int main() {
    int a[10] = {0};
    f(a);
    return 0;
}` },
];
