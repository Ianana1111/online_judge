#include <stdio.h>

int main(void) {
    long long cuts;
    while (scanf("%lld", &cuts) == 1 && cuts >= 0) {
        printf("%lld\n", 1 + cuts * (cuts + 1) / 2);
    }
    return 0;
}
