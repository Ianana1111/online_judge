#include <stdio.h>

int main(void) {
    static long long triangles[1000001];
    for (long long largest = 3; largest <= 1000000; ++largest) {
        triangles[largest] = triangles[largest - 1]
                           + (largest - 2) * (largest - 2) / 4;
    }
    int n;
    while (scanf("%d", &n) == 1 && n >= 3) printf("%lld\n", triangles[n]);
    return 0;
}
