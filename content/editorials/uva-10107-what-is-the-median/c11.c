#include <stdio.h>
static long long low[10001], high[10001];
static int nl, nh;
static void push_low(long long x) {
    int i = ++nl;
    while (i > 1 && low[i / 2] < x) { low[i] = low[i / 2]; i /= 2; }
    low[i] = x;
}
static void push_high(long long x) {
    int i = ++nh;
    while (i > 1 && high[i / 2] > x) { high[i] = high[i / 2]; i /= 2; }
    high[i] = x;
}
static long long pop_low(void) {
    long long top = low[1], last = low[nl--]; int i = 1;
    while (i * 2 <= nl) {
        int child = i * 2;
        if (child < nl && low[child + 1] > low[child]) child++;
        if (low[child] <= last) break;
        low[i] = low[child]; i = child;
    }
    if (nl) low[i] = last;
    return top;
}
static long long pop_high(void) {
    long long top = high[1], last = high[nh--]; int i = 1;
    while (i * 2 <= nh) {
        int child = i * 2;
        if (child < nh && high[child + 1] < high[child]) child++;
        if (high[child] >= last) break;
        high[i] = high[child]; i = child;
    }
    if (nh) high[i] = last;
    return top;
}
int main(void) {
    long long x;
    while (scanf("%lld", &x) == 1) {
        if (!nl || x <= low[1]) push_low(x); else push_high(x);
        if (nl > nh + 1) push_high(pop_low());
        else if (nh > nl) push_low(pop_high());
        printf("%lld\n", nl == nh ? (low[1] + high[1]) / 2 : low[1]);
    }
    return 0;
}
