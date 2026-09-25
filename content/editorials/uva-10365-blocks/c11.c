#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int blocks;
        scanf("%d", &blocks);
        int answer = 6 * blocks;
        for (int a = 1; a * a * a <= blocks; ++a) {
            if (blocks % a != 0) continue;
            for (int b = a; b * b <= blocks / a; ++b) {
                if ((blocks / a) % b != 0) continue;
                int c = blocks / a / b;
                int area = 2 * (a * b + b * c + c * a);
                if (area < answer) answer = area;
            }
        }
        printf("%d\n", answer);
    }
    return 0;
}
