#include <stdio.h>
int main(void) {
    long long count[27][352] = {{0}};
    count[0][0] = 1;
    for (int value = 1; value <= 26; value++) {
        for (int length = 26; length >= 1; length--) {
            for (int sum = 351; sum >= value; sum--)
                count[length][sum] += count[length - 1][sum - value];
        }
    }
    int length, sum, case_no = 0;
    while (scanf("%d %d", &length, &sum) == 2 && (length || sum)) {
        long long answer = length <= 26 && sum <= 351 ? count[length][sum] : 0;
        printf("Case %d: %lld\n", ++case_no, answer);
    }
    return 0;
}
