#include <stdio.h>
static void print_number(long long n) {
    if (n >= 10000000) { print_number(n / 10000000); printf(" kuti"); n %= 10000000; }
    if (n >= 100000) { printf(" %lld lakh", n / 100000); n %= 100000; }
    if (n >= 1000) { printf(" %lld hajar", n / 1000); n %= 1000; }
    if (n >= 100) { printf(" %lld shata", n / 100); n %= 100; }
    if (n) printf(" %lld", n);
}
int main(void) {
    long long number; int case_no = 0;
    while (scanf("%lld", &number) == 1) {
        printf("%4d.", ++case_no);
        if (number == 0) printf(" 0");
        else print_number(number);
        putchar('\n');
    }
    return 0;
}
