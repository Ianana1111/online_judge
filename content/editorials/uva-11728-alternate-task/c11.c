#include <stdio.h>

int main(void) {
    int sum[1001] = {0};
    int largest[1001];
    for (int i = 0; i <= 1000; ++i) largest[i] = -1;
    for (int divisor = 1; divisor <= 1000; ++divisor)
        for (int multiple = divisor; multiple <= 1000; multiple += divisor)
            sum[multiple] += divisor;
    for (int n = 1; n <= 1000; ++n)
        if (sum[n] <= 1000) largest[sum[n]] = n;
    int target, case_number = 0;
    while (scanf("%d", &target) == 1 && target != 0)
        printf("Case %d: %d\n", ++case_number, largest[target]);
    return 0;
}
