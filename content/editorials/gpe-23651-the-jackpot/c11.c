#include <stdio.h>

int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        long long ending = 0, best = 0;
        for (int i = 0; i < n; ++i) {
            long long value;
            scanf("%lld", &value);
            ending += value;
            if (ending < 0) ending = 0;
            if (ending > best) best = ending;
        }
        if (best > 0) printf("The maximum winning streak is %lld.\n", best);
        else puts("Losing streak.");
    }
    return 0;
}
