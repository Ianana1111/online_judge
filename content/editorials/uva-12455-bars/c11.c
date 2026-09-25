#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int target, count;
        scanf("%d %d", &target, &count);
        unsigned char *possible = calloc((size_t)target + 1, 1);
        if (possible == NULL) return 1;
        possible[0] = 1;
        for (int i = 0; i < count; ++i) {
            long long length;
            scanf("%lld", &length);
            if (length > target) continue;
            for (int sum = target; sum >= length; --sum)
                if (possible[sum - length]) possible[sum] = 1;
        }
        puts(possible[target] ? "YES" : "NO");
        free(possible);
    }
    return 0;
}
