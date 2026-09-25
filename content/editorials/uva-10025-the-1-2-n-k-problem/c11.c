#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 0; case_number < tests; ++case_number) {
        long long target;
        scanf("%lld", &target);
        target = llabs(target);
        long long n = 0, sum = 0;
        while (n == 0 || sum < target || (sum - target) % 2 != 0) {
            ++n;
            sum += n;
        }
        if (case_number > 0) putchar('\n');
        printf("%lld\n", n);
    }
    return 0;
}
