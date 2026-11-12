#include <stdio.h>

int main(void) {
    long n;
    while (scanf("%ld", &n) == 1 && n != 0) {
        long value = n <= 100 ? 91 : n - 10;
        printf("f91(%ld) = %ld\n", n, value);
    }
    return 0;
}
