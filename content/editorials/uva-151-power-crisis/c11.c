#include <stdio.h>
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n) {
        int step = 1;
        while (1) {
            int survivor = 0;
            for (int size = 2; size <= n - 1; size++) survivor = (survivor + step) % size;
            if (survivor == 11) break;
            step++;
        }
        printf("%d\n", step);
    }
    return 0;
}
