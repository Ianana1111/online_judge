#include <stdio.h>

int main(void) {
    long long velocity, time;
    while (scanf("%lld %lld", &velocity, &time) == 2) {
        printf("%lld\n", 2 * velocity * time);
    }
    return 0;
}
