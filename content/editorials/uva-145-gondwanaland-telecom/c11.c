#include <stdio.h>

int main(void) {
    const int rates[5][3] = {
        {10, 6, 2}, {25, 15, 5}, {53, 33, 13},
        {87, 47, 17}, {144, 80, 30}
    };
    char plan, phone[32];
    int sh, sm, eh, em;
    while (scanf(" %c", &plan) == 1 && plan != '#') {
        scanf("%31s %d %d %d %d", phone, &sh, &sm, &eh, &em);
        int start = sh * 60 + sm, finish = eh * 60 + em;
        if (finish <= start) finish += 1440;
        int minutes[3] = {0, 0, 0};
        for (int t = start; t < finish; ++t) {
            int clock = t % 1440;
            int period = clock >= 480 && clock < 1080 ? 0
                       : clock >= 1080 && clock < 1320 ? 1 : 2;
            ++minutes[period];
        }
        int cents = 0;
        for (int i = 0; i < 3; ++i) cents += minutes[i] * rates[plan - 'A'][i];
        printf("%10s%6d%6d%6d%3c%5d.%02d\n", phone, minutes[0],
               minutes[1], minutes[2], plan, cents / 100, cents % 100);
    }
    return 0;
}
