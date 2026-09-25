#include <stdio.h>
#include <string.h>

int main(void) {
    int value;
    while (scanf("%d", &value) == 1 && value != 0) {
        unsigned char seen[10000] = {0};
        int count = 0;
        while (!seen[value]) {
            seen[value] = 1;
            ++count;
            value = (value * value / 100) % 10000;
        }
        printf("%d\n", count);
    }
    return 0;
}
