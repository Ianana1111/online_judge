#include <stdio.h>
#include <stdlib.h>

static int count[26], used[26], n;

static int descending(const void *x, const void *y) {
    return *(const int *)y - *(const int *)x;
}

static int take(int a, int b) {
    for (int w = 0; w < n; ++w)
        if (!used[w] && (count[w] == a || count[w] == b)) { used[w] = 1; return w; }
    return -1;
}

int main(void) {
    int cases;
    if (scanf("%d", &cases) != 1) return 0;
    while (cases--) {
        if (scanf("%d", &n) != 1) break;
        for (int w = 0; w < 26; ++w) count[w] = used[w] = 0;
        char ch;
        while (scanf(" %c", &ch) == 1 && ch != '#')
            if (ch >= 'A' && ch < 'A' + n) ++count[ch - 'A'];
        int ranked[26], order[26], right_need[13];
        for (int w = 0; w < n; ++w) ranked[w] = count[w];
        qsort(ranked, (size_t)n, sizeof(int), descending);
        for (int k = 0; k < n / 2; ++k) {
            int a = ranked[2 * k], b = ranked[2 * k + 1];
            int w = take(a, b);
            order[k] = w;
            right_need[k] = count[w] == a ? b : a;
        }
        if (n % 2 == 1) order[n / 2] = take(ranked[n - 1], ranked[n - 1]);
        for (int k = n / 2 - 1; k >= 0; --k) order[n - 1 - k] = take(right_need[k], right_need[k]);
        for (int i = 0; i < n; ++i) printf("%c%c", 'A' + order[i], i + 1 == n ? '\n' : ' ');
        for (int i = 0; i < n; ++i) printf("%d%c", count[order[i]], i + 1 == n ? '\n' : ' ');
    }
    return 0;
}
