#include <stdio.h>

int main(void) {
    int bottles;
    while (scanf("%d", &bottles) == 1) {
        printf("%d\n", bottles + bottles / 2);
    }
    return 0;
}
