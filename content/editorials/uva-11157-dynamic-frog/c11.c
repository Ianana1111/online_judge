#include <stdio.h>
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 1; tc <= tests; tc++) {
        int n, distance, points[204], count = 0;
        scanf("%d %d", &n, &distance);
        points[count++] = 0; points[count++] = 0;
        for (int i = 0; i < n; i++) {
            char type; int position; scanf(" %c-%d", &type, &position);
            points[count++] = position;
            if (type == 'B') points[count++] = position;
        }
        points[count++] = distance; points[count++] = distance;
        int best = 0;
        for (int i = 2; i < count; i++) {
            int jump = points[i] - points[i - 2];
            if (jump > best) best = jump;
        }
        printf("Case %d: %d\n", tc, best);
    }
    return 0;
}
