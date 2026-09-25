#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        long long balance = 0, work = 0;
        for (int i = 0; i < n; ++i) {
            long long value;
            scanf("%lld", &value);
            balance += value;
            work += llabs(balance);
        }
        printf("%lld\n", work);
    }
    return 0;
}
