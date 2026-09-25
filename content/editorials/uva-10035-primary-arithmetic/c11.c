#include <stdio.h>

int main(void) {
    long long a, b;
    while (scanf("%lld %lld", &a, &b) == 2 && (a != 0 || b != 0)) {
        int carry = 0, operations = 0;
        while (a != 0 || b != 0) {
            int sum = (int)(a % 10 + b % 10) + carry;
            carry = sum >= 10;
            operations += carry;
            a /= 10;
            b /= 10;
        }
        if (operations == 0) puts("No carry operation.");
        else printf("%d carry operation%s\n", operations, operations == 1 ? "." : "s.");
    }
    return 0;
}
