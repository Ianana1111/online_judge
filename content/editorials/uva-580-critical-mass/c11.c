#include <stdio.h>

int main(void) {
    long long safe[31] = {1, 2, 4};
    for (int length = 3; length <= 30; ++length)
        safe[length] = safe[length - 1] + safe[length - 2] + safe[length - 3];
    int n;
    while (scanf("%d", &n) == 1 && n != 0)
        printf("%lld\n", (1LL << n) - safe[n]);
    return 0;
}
