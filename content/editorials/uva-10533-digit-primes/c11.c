#include <stdio.h>

int main(void) {
    static unsigned char prime[1000000];
    static int prefix[1000000];
    for (int i = 2; i < 1000000; ++i) prime[i] = 1;
    for (int p = 2; p * p < 1000000; ++p)
        if (prime[p])
            for (int multiple = p * p; multiple < 1000000; multiple += p)
                prime[multiple] = 0;
    for (int value = 1; value < 1000000; ++value) {
        int digit_sum = 0;
        for (int rest = value; rest > 0; rest /= 10) digit_sum += rest % 10;
        prefix[value] = prefix[value - 1] + (prime[value] && prime[digit_sum]);
    }
    int queries;
    if (scanf("%d", &queries) != 1) return 0;
    while (queries-- > 0) {
        int left, right;
        scanf("%d %d", &left, &right);
        printf("%d\n", prefix[right] - prefix[left - 1]);
    }
    return 0;
}
