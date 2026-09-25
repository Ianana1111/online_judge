#include <stdio.h>

int main(void) {
    int squares[316];
    for (int root = 1; root <= 316; ++root) squares[root - 1] = root * root;
    int low, high;
    while (scanf("%d %d", &low, &high) == 2 && (low != 0 || high != 0)) {
        int count = 0;
        for (int i = 0; i < 316; ++i)
            if (low <= squares[i] && squares[i] <= high) ++count;
        printf("%d\n", count);
    }
    return 0;
}
