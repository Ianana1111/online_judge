#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int hour, minute;
    while (scanf("%d:%d", &hour, &minute) == 2) {
        if (hour == 0 && minute == 0) break;
        int twice_angle = abs(60 * (hour % 12) + minute - 12 * minute);
        if (720 - twice_angle < twice_angle) twice_angle = 720 - twice_angle;
        printf("%.3f\n", twice_angle / 2.0);
    }
    return 0;
}
