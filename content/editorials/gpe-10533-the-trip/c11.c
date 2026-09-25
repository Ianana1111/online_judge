#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n) {
        long long *paid = malloc(n * sizeof(long long));
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            long long dollars, cents;
            scanf("%lld.%lld", &dollars, &cents);
            paid[i] = dollars * 100 + cents;
            sum += paid[i];
        }
        long long low = sum / n, high = (sum + n - 1) / n;
        long long give = 0, receive = 0;
        for (int i = 0; i < n; i++) {
            if (paid[i] > high) give += paid[i] - high;
            if (paid[i] < low) receive += low - paid[i];
        }
        long long answer = give > receive ? give : receive;
        printf("$%lld.%02lld\n", answer / 100, answer % 100);
        free(paid);
    }
    return 0;
}
