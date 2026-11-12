// 解譯器單元測試：每個程式都會用 gcc 編譯執行一次、再用解譯器執行一次，輸出必須完全相同。
// 程式都不能有未定義行為，也不能依賴平台（例如 %p、rand、ctype 回傳的實際數值）。
const H = '#include <stdio.h>\n';

export default [
  { name: 'printf 整數旗標與寬度', src: H + `int main() {
    int a = 42, b = -42;
    printf("[%d][%5d][%-5d][%05d][%+d][% d][%+d]\\n", a, a, a, a, a, a, b);
    printf("[%.3d][%8.3d][%-8.3d|][%.0d][%x][%X][%o][%#x][%#o][%#X]\\n", a, a, a, 0, 255, 255, 8, 255, 8, 0);
    printf("[%u][%c][%5c][%-3c|][%%][%s][%8s][%-8s|][%.2s]\\n", 3000000000u, 'A', 'B', 'C', "hi", "hi", "hi", "hello");
    printf("[%*d][%-*d][%.*d]\\n", 6, 7, 6, 7, 4, 7);
    int n = printf("abc\\n");
    printf("%d\\n", n);
    return 0;
}` },
  { name: 'printf 浮點數：%f %e %g 與四捨五入', src: H + `int main() {
    double v[] = {0.0, 1.0, -1.5, 3.14159265358979, 2.5, 0.125, 1e-5, 123456789.0, 1e21, 0.1 + 0.2, 1.0 / 3, 2.675, 1e100, -0.0};
    for (int i = 0; i < 14; i++) {
        double x = v[i];
        printf("%f|%.2f|%.0f|%e|%.3E|%g|%G|%.3g|%10.4f|%-10.1f|%+.1e|%#.0f|%#g\\n", x, x, x, x, x, x, x, x, x, x, x, x, x);
    }
    printf("%.0f %.0f %.0f %.0f %.1f %.1f\\n", 0.5, 1.5, 2.5, 3.5, 0.25, 0.35);
    printf("%g %g %g %g %g\\n", 100000.0, 1000000.0, 0.0001, 0.00001, 123.456);
    float f = 0.1f;
    printf("%f %.10f %g\\n", f, f, f * 3);
    return 0;
}` },
  { name: 'int 溢位會 wrap、long long 不會', src: H + `int main() {
    int k = 2147483647;
    k = k + 1;
    printf("%d\\n", k);
    int m = 50000;
    printf("%d %lld\\n", m * m, (long long)m * m);
    unsigned int u = 0;
    u = u - 1;
    printf("%u\\n", u);
    long long big = 9223372036854775807LL;
    big = big + 1;
    printf("%lld\\n", big);
    unsigned long long ub = 18446744073709551615ULL;
    printf("%llu %llu\\n", ub, ub + 2);
    short s = 32767; s++;
    char c = 127; c++;
    unsigned char uc = 255; uc++;
    printf("%d %d %d\\n", s, c, uc);
    return 0;
}` },
  { name: 'unsigned 比較的陷阱與整數提升', src: H + `#include <string.h>
int main() {
    int a = -1;
    unsigned int b = 1;
    if (a < b) printf("a < b\\n"); else printf("a >= b (unsigned)\\n");
    long long c = -1;
    if (c < b) printf("c < b\\n"); else printf("c >= b\\n");
    char s[] = "abc";
    for (int i = -1; i < 1; i++) {
        if (i < (int)strlen(s)) printf("%d ok\\n", i);
    }
    unsigned char x = 200, y = 100;
    int z = x + y;
    printf("%d %d\\n", z, (unsigned char)(x + y));
    printf("%d %d %d\\n", -7 / 2, -7 % 2, 7 % -2);
    printf("%u\\n", -1 / 2u);
    return 0;
}` },
  { name: 'char 運算與 ASCII', src: H + `int main() {
    char c = '7';
    int d = c - '0';
    printf("%d %c %c %d\\n", d, 'a' + 1, 'A' + 32, 'z' - 'a');
    char s[] = "Hello";
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] >= 'a' && s[i] <= 'z') s[i] = s[i] - 32;
    }
    printf("%s %d\\n", s, (int)sizeof(s));
    printf("[%c][%d][%d]\\n", '\\101', '\\n', '\\x41');
    return 0;
}` },
  { name: '二維陣列是 row-major', src: H + `int main() {
    int a[3][3];
    int k = 1;
    for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) a[i][j] = k++;
    int *p = &a[0][0];
    for (int i = 0; i < 9; i++) printf("%d ", p[i]);
    printf("\\n%d %d %d\\n", a[0][3], a[1][-1], *(*(a + 2) + 1));
    printf("%d %d %d\\n", (int)sizeof(a), (int)sizeof(a[0]), (int)(&a[1][0] - &a[0][0]));
    int b[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int c[2][3] = {1, 2, 3, 4};
    int d[][2] = {{1, 2}, {3}};
    printf("%d %d %d %d %d\\n", b[1][2], c[1][0], c[1][2], d[1][0], d[1][1]);
    return 0;
}` },
  { name: '指標運算與 swap', src: H + `void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }
int sum(int *a, int n) { int s = 0; for (int i = 0; i < n; i++) s += *(a + i); return s; }
int main() {
    int a = 3, b = 5;
    swap(&a, &b);
    printf("%d %d\\n", a, b);
    int arr[5] = {1, 2, 3, 4, 5};
    int *p = arr;
    p += 2;
    printf("%d %d %d %d\\n", *p, p[1], *(p - 1), (int)(p - arr));
    *p = 30;
    p++;
    *p += 10;
    printf("%d %d %d\\n", arr[2], arr[3], sum(arr, 5));
    int *q = &arr[4];
    printf("%d %d\\n", q > p, q == p);
    int **pp = &p;
    **pp = 99;
    printf("%d\\n", arr[3]);
    char *s = "hello";
    printf("%c %s\\n", *(s + 1), s + 2);
    return 0;
}` },
  { name: '遞迴：gcd、階乘、費氏', src: H + `int gcd(int a, int b) { if (b == 0) return a; return gcd(b, a % b); }
long long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
int fib(int n) { if (n < 2) return n; return fib(n - 1) + fib(n - 2); }
int depth(int n) { if (n == 0) return 0; return 1 + depth(n - 1); }
int main() {
    printf("%d %lld %d %d\\n", gcd(48, 18), fact(20), fib(20), depth(1000));
    return 0;
}` },
  { name: 'switch 的 fallthrough 與 default', src: H + `int main() {
    for (int i = 0; i < 6; i++) {
        switch (i) {
            case 0: printf("zero ");
            case 1: printf("one ");
                break;
            default: printf("other ");
            case 4: printf("four ");
                break;
            case 5: { int t = i * 2; printf("ten=%d ", t); }
        }
        printf("\\n");
    }
    char op = '*';
    switch (op) { case '+': printf("add\\n"); break; case '*': printf("mul\\n"); break; }
    return 0;
}` },
  { name: 'VLA 與陣列參數', src: H + `void show(int n, int m, int a[n][m]) {
    for (int i = 0; i < n; i++) { for (int j = 0; j < m; j++) printf("%d ", a[i][j]); printf("\\n"); }
}
int total(int a[], int n) { int s = 0; for (int i = 0; i < n; i++) s += a[i]; return s; }
int main() {
    int n = 3, m = 4;
    int a[n][m];
    for (int i = 0; i < n; i++) for (int j = 0; j < m; j++) a[i][j] = i * 10 + j;
    show(n, m, a);
    int v[n];
    for (int i = 0; i < n; i++) v[i] = i + 1;
    printf("%d %d\\n", total(v, n), (int)sizeof(a));
    return 0;
}` },
  { name: 'scanf 回傳值與 EOF', input: '3 4\nx 7\n', src: H + `int main() {
    int a, b, r;
    r = scanf("%d %d", &a, &b);
    printf("r=%d a=%d b=%d\\n", r, a, b);
    r = scanf("%d", &a);
    printf("r=%d\\n", r);
    char c;
    r = scanf(" %c %d", &c, &b);
    printf("r=%d c=%c b=%d\\n", r, c, b);
    r = scanf("%d", &a);
    printf("r=%d %d\\n", r, r == EOF);
    return 0;
}` },
  { name: 'scanf %c 會讀到換行', input: '5\nA\n', src: H + `int main() {
    int n;
    char c, d;
    scanf("%d", &n);
    scanf("%c", &c);
    scanf("%c", &d);
    printf("%d [%d] [%c]\\n", n, c, d);
    return 0;
}` },
  { name: 'scanf 各種格式', input: '  -12 0x1F 017 3.5 2.25 hello world 99999999999 4294967295 a,b\n', src: H + `int main() {
    int a, b, c; float f; double d; char s[20], t[20]; long long ll; unsigned int u; char x, y;
    int r = scanf("%d %x %o %f %lf %s %s %lld %u %c,%c", &a, &b, &c, &f, &d, s, t, &ll, &u, &x, &y);
    printf("%d %d %d %d %.2f %.2f %s %s %lld %u %c %c\\n", r, a, b, c, f, d, s, t, ll, u, x, y);
    return 0;
}` },
  { name: '讀到 EOF 的加總', input: '1 2 3\n4\n5', src: H + `int main() {
    int x, sum = 0, cnt = 0;
    while (scanf("%d", &x) != EOF) { sum += x; cnt++; }
    printf("%d %d\\n", cnt, sum);
    return 0;
}` },
  { name: 'getchar、putchar、puts、fgets', input: 'ab\ncd ef\nlast', src: H + `int main() {
    int c;
    c = getchar(); putchar(c); putchar('\\n');
    c = getchar(); putchar(c - 32); putchar('\\n');
    getchar();
    char line[100];
    fgets(line, 100, stdin);
    printf("[%s]", line);
    char small[3];
    fgets(small, 3, stdin);
    printf("[%s]\\n", small);
    puts("done");
    return 0;
}` },
  { name: 'string.h', src: H + `#include <string.h>
int main() {
    char a[20] = "hello", b[20];
    strcpy(b, a);
    strcat(b, " world");
    printf("%s %d %d\\n", b, (int)strlen(b), (int)strlen(""));
    printf("%d %d %d\\n", strcmp("abc", "abc") == 0, strcmp("abc", "abd") < 0, strcmp("b", "a") > 0);
    printf("%d %d\\n", strncmp("abcx", "abcy", 3) == 0, strncmp("abcx", "abcy", 4) < 0);
    char *p = strchr(b, 'w');
    printf("%s %d\\n", p, strchr(b, 'z') == NULL);
    char c[10];
    strncpy(c, "abcdef", 3);
    c[3] = '\\0';
    printf("%s\\n", c);
    int arr[5];
    memset(arr, 0, sizeof(arr));
    printf("%d %d\\n", arr[0], arr[4]);
    memset(arr, -1, sizeof(arr));
    printf("%d\\n", arr[2]);
    printf("%d\\n", (int)strlen("中文"));
    return 0;
}` },
  { name: 'math.h 與 stdlib.h', src: H + `#include <math.h>
#include <stdlib.h>
int main() {
    printf("%.4f %.4f %.1f %.1f %.1f %.1f\\n", sqrt(2.0), pow(2, 0.5), floor(-2.5), ceil(-2.5), round(2.5), round(-2.5));
    printf("%.3f %.3f %.3f %.0f\\n", fabs(-3.25), log(10.0), exp(1.0), pow(2, 10));
    printf("%d %ld %lld %d %d\\n", abs(-5), labs(-6L), llabs(-7LL), atoi("  -123abc"), atoi("x"));
    printf("%.6f %.6f\\n", sin(1.0), cos(1.0));
    return 0;
}` },
  { name: 'ctype.h（只看成不成立）', src: H + `#include <ctype.h>
int main() {
    const char *s = "aZ9 _!";
    for (int i = 0; s[i]; i++) {
        printf("%d%d%d%d%d%d %c%c\\n", !!isdigit(s[i]), !!isalpha(s[i]), !!isalnum(s[i]), !!isupper(s[i]),
            !!islower(s[i]), !!isspace(s[i]), toupper(s[i]), tolower(s[i]));
    }
    return 0;
}` },
  { name: '迴圈：break、continue、do-while、巢狀', src: H + `int main() {
    for (int i = 0; i < 10; i++) { if (i % 2) continue; if (i > 6) break; printf("%d ", i); }
    printf("\\n");
    int k = 0;
    do { k += 3; } while (k < 10);
    printf("%d\\n", k);
    int j = 5;
    while (j--) printf("%d", j);
    printf("\\n");
    for (int i = 1; i <= 4; i++) {
        for (int t = 0; t < i; t++) printf("*");
        printf("\\n");
    }
    int n = 0;
    for (;;) { n++; if (n == 5) break; }
    printf("%d\\n", n);
    return 0;
}` },
  { name: '運算子：位元、位移、三元、逗號、短路', src: H + `int f(int x) { printf("f(%d) ", x); return x; }
int main() {
    int a = 12, b = 10;
    printf("%d %d %d %d %d %d\\n", a & b, a | b, a ^ b, ~a, a << 2, a >> 2);
    printf("%d %d\\n", -16 >> 2, (unsigned)0x80000000 >> 31);
    printf("%lld %lld\\n", 1LL << 40, -1LL >> 1);
    int x = 0;
    if (x != 0 && 10 / x > 1) printf("no\\n"); else printf("short\\n");
    if (f(1) || f(2)) printf("\\n");
    if (f(0) && f(3)) printf("x"); printf("\\n");
    int y = (a > b) ? a : b;
    int z = (x = 3, x + 4);
    printf("%d %d %d\\n", y, z, a > b ? a > 11 ? 1 : 2 : 3);
    int i = 5;
    int p = i++ + 10, q = ++i * 2;
    printf("%d %d %d\\n", p, q, i);
    a += 3; a -= 1; a *= 2; a /= 3; a %= 5; a <<= 3; a >>= 1; a |= 1; a &= 13; a ^= 6;
    printf("%d\\n", a);
    printf("%d %d %d\\n", !5, !0, !!7);
    return 0;
}` },
  { name: '型態轉換與 sizeof', src: H + `int main() {
    printf("%d %d %d %d %d %d\\n", (int)sizeof(char), (int)sizeof(int), (int)sizeof(long long), (int)sizeof(double), (int)sizeof(float), (int)sizeof(int *));
    printf("%zu %zu\\n", sizeof(short), sizeof 1.0f);
    double avg = (double)7 / 2;
    int t = 7 / 2;
    printf("%.2f %d %.2f\\n", avg, t, 7 / 2.0);
    printf("%d %d %d\\n", (int)3.99, (int)-3.99, (int)'A');
    printf("%d %d\\n", (char)300, (unsigned char)-1);
    float f = 1.1f;
    double d = f;
    printf("%.10f\\n", d);
    long long big = 1LL << 40;
    int small = (int)big;
    printf("%d %lld\\n", small, big);
    printf("%.1f\\n", 5 / 2 * 2.0);
    return 0;
}` },
  { name: '全域變數、static 變數', src: H + `int counter;
int table[5] = {1, 2};
const int LIMIT = 3;
int next() { static int n = 0; n++; return n; }
int main() {
    counter += 5;
    printf("%d %d %d %d\\n", counter, table[1], table[4], LIMIT);
    next(); next();
    printf("%d\\n", next());
    return 0;
}` },
  { name: '#define 常數與字串接起來', src: H + `#define MAX 10
#define MSG "hello " "world"
#define AREA (MAX * MAX)
int main() {
    int a[MAX];
    for (int i = 0; i < MAX; i++) a[i] = i * i;
    printf("%d %s %d\\n", a[MAX - 1], MSG, AREA);
    printf("tab\\there \\"q\\" back\\\\slash \\x41\\101\\n");
    return 0;
}` },
  { name: 'bool（stdbool.h）', src: H + `#include <stdbool.h>
bool isEven(int n) { return n % 2 == 0; }
int main() {
    bool seen[5] = {false};
    seen[2] = true;
    bool b = 5;
    printf("%d %d %d %d\\n", seen[2], seen[3], b, isEven(4));
    if (seen[2] == true && !seen[0]) printf("ok\\n");
    return 0;
}` },
  { name: '字串陣列與 char 指標', src: H + `int main() {
    char s[2][6] = {"abc", "de"};
    printf("%s %s %c\\n", s[0], s[1], s[1][1]);
    char word[10];
    int n = 0;
    for (char c = 'a'; c < 'f'; c++) word[n++] = c;
    word[n] = '\\0';
    printf("%s\\n", word);
    char *p = word;
    int len = 0;
    while (*p != '\\0') { len++; p++; }
    printf("%d\\n", len);
    return 0;
}` },
  { name: '數字反轉與 unsigned long long', src: H + `unsigned long long rev(unsigned long long x) { unsigned long long r = 0; while (x > 0) { r = r * 10 + x % 10; x /= 10; } return r; }
int main() {
    unsigned long long x = 18446744073709551615ULL;
    printf("%llu %llu\\n", rev(12345), x / 10);
    long long y = -9223372036854775807LL - 1;
    printf("%lld %lld\\n", y, y / -3);
    printf("%lld %lld %lld\\n", 7LL / -2, -7LL % 3, 1000000007LL * 1000000007LL % 998244353);
    return 0;
}` },
  { name: '輸出很多行', src: H + `int main() {
    for (int i = 1; i <= 9; i++) {
        for (int j = 1; j <= 9; j++) printf("%2d ", i * j);
        printf("\\n");
    }
    return 0;
}` },
  { name: '函式原型與 void 函式', src: H + `void hello(int n);
int square(int);
int main() {
    hello(square(3));
    return 0;
}
void hello(int n) { printf("n=%d\\n", n); return; }
int square(int x) { return x * x; }` },
  { name: '區塊作用域與遮蔽', src: H + `int x = 1;
int main() {
    printf("%d ", x);
    int x = 2;
    { int x = 3; printf("%d ", x); }
    printf("%d\\n", x);
    for (int i = 0; i < 2; i++) { int t = i * 10; printf("%d ", t); }
    printf("\\n");
    return 0;
}` },
  { name: 'main 回傳值與 exit', src: H + `#include <stdlib.h>
int main() {
    printf("before\\n");
    exit(0);
    printf("after\\n");
}` },
];
