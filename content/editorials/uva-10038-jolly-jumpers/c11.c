#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int n;
    while (scanf("%d", &n) == 1) {
        unsigned char seen[3001] = {0};
        long long previous, current;
        scanf("%lld", &previous);
        int good = 1;
        for (int i = 1; i < n; ++i) {
            scanf("%lld", &current);
            long long difference = llabs(current - previous);
            if (difference < 1 || difference >= n || seen[difference]) good = 0;
            else seen[difference] = 1;
            previous = current;
        }
        puts(good ? "Jolly" : "Not jolly");
    }
    return 0;
}
