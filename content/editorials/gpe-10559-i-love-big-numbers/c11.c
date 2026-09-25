#include <stdio.h>

int main(void) {
    int digits[3000] = {1};
    int sums[1001] = {1};
    int length = 1;
    for (int n = 1; n <= 1000; ++n) {
        int carry = 0;
        for (int i = 0; i < length; ++i) {
            int product = digits[i] * n + carry;
            digits[i] = product % 10;
            carry = product / 10;
        }
        while (carry != 0) {
            digits[length++] = carry % 10;
            carry /= 10;
        }
        for (int i = 0; i < length; ++i) sums[n] += digits[i];
    }
    int n;
    while (scanf("%d", &n) == 1) printf("%d\n", sums[n]);
    return 0;
}
