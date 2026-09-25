#include <stdio.h>
#include <stdlib.h>

static long long cross(long long ax, long long ay, long long bx, long long by) {
    return ax * by - ay * bx;
}

static void format_ratio(long long numerator, long long denominator, char *text) {
    if (denominator < 0) { numerator = -numerator; denominator = -denominator; }
    long long rounded = (2 * llabs(numerator) * 100 + denominator) / (2 * denominator);
    sprintf(text, "%s%lld.%02lld", numerator < 0 && rounded ? "-" : "",
            rounded / 100, rounded % 100);
}

int main(void) {
    int cases;
    if (scanf("%d", &cases) != 1) return 0;
    puts("INTERSECTING LINES OUTPUT");
    for (int i = 0; i < cases; ++i) {
        long long x1, y1, x2, y2, x3, y3, x4, y4;
        scanf("%lld %lld %lld %lld %lld %lld %lld %lld",
              &x1, &y1, &x2, &y2, &x3, &y3, &x4, &y4);
        long long ux = x2 - x1, uy = y2 - y1;
        long long vx = x4 - x3, vy = y4 - y3;
        long long dx = x3 - x1, dy = y3 - y1;
        long long denominator = cross(ux, uy, vx, vy);
        if (!denominator) {
            puts(cross(dx, dy, ux, uy) == 0 ? "LINE" : "NONE");
        } else {
            long long fraction = cross(dx, dy, vx, vy);
            char x[64], y[64];
            format_ratio(x1 * denominator + ux * fraction, denominator, x);
            format_ratio(y1 * denominator + uy * fraction, denominator, y);
            printf("POINT %s %s\n", x, y);
        }
    }
    puts("END OF OUTPUT");
    return 0;
}
