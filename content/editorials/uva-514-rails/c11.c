#include <stdio.h>
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n) {
        int target[1000], station[1000], first;
        while (scanf("%d", &first) == 1 && first) {
            target[0] = first;
            for (int i = 1; i < n; i++) scanf("%d", &target[i]);
            int top = 0, next = 1, possible = 1;
            for (int i = 0; i < n; i++) {
                int wanted = target[i];
                while (next <= n && (!top || station[top - 1] != wanted)) station[top++] = next++;
                if (!top || station[top - 1] != wanted) { possible = 0; break; }
                top--;
            }
            puts(possible ? "Yes" : "No");
        }
        putchar('\n');
    }
    return 0;
}
