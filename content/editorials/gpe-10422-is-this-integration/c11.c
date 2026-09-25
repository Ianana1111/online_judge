#include <stdio.h>

int main(void) {
    const long double pi = 3.141592653589793238462643383279502884L;
    const long double root3 = 1.732050807568877293527446341505872367L;
    long double side;
    while (scanf("%Lf", &side) == 1) {
        long double square = side * side;
        long double striped = square * (1 - root3 + pi / 3);
        long double dotted = square * (2 * root3 - 4 + pi / 3);
        long double rest = square * (4 - root3 - 2 * pi / 3);
        printf("%.3Lf %.3Lf %.3Lf\n", striped, dotted, rest);
    }
    return 0;
}
