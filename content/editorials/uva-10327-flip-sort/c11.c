#include <stdio.h>

int main(void) {
    int n;
    while (scanf("%d", &n) == 1) {
        long long values[1000];
        for (int i = 0; i < n; ++i) scanf("%lld", &values[i]);
        long long inversions = 0;
        for (int i = 0; i < n; ++i)
            for (int j = i + 1; j < n; ++j)
                if (values[i] > values[j]) ++inversions;
        printf("Minimum exchange operations : %lld\n", inversions);
    }
    return 0;
}
