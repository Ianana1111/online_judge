#include <stdio.h>
#include <stdlib.h>
static long long millimetres(const char *s) {
    int sign = 1;
    if (*s == '-') { sign = -1; s++; }
    long long whole = 0, fraction = 0;
    while (*s && *s != '.') { whole = whole * 10 + *s - '0'; s++; }
    if (*s == '.') {
        s++; int digits = 0;
        while (*s && digits < 3) { fraction = fraction * 10 + *s - '0'; s++; digits++; }
        while (digits++ < 3) fraction *= 10;
    }
    return sign * (whole * 1000 + fraction);
}
static void print_coordinate(long long x) {
    if (x < 0) putchar('-');
    long long magnitude = x < 0 ? -x : x;
    printf("%lld.%03lld", magnitude / 1000, magnitude % 1000);
}
int main(void) {
    char token[8][32];
    while (scanf("%31s", token[0]) == 1) {
        for (int i = 1; i < 8; i++) scanf("%31s", token[i]);
        long long point[4][2], common[2] = {0, 0}, answer[2] = {0, 0};
        for (int i = 0; i < 8; i++) point[i / 2][i % 2] = millimetres(token[i]);
        for (int i = 0; i < 2; i++) for (int j = 2; j < 4; j++)
            if (point[i][0] == point[j][0] && point[i][1] == point[j][1]) {
                common[0] = point[i][0]; common[1] = point[i][1];
            }
        for (int axis = 0; axis < 2; axis++) {
            for (int i = 0; i < 4; i++) answer[axis] += point[i][axis];
            answer[axis] -= 3 * common[axis];
        }
        print_coordinate(answer[0]); putchar(' '); print_coordinate(answer[1]); putchar('\n');
    }
    return 0;
}
