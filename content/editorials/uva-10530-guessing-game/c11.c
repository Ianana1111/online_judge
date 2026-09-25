#include <stdio.h>
#include <string.h>

int main(void) {
    int low = 1, high = 10, guess;
    char first[20], second[20];
    while (scanf("%d", &guess) == 1 && guess != 0) {
        scanf("%19s %19s", first, second);
        if (strcmp(first, "too") == 0 && strcmp(second, "high") == 0) {
            if (guess - 1 < high) high = guess - 1;
        } else if (strcmp(first, "too") == 0 && strcmp(second, "low") == 0) {
            if (guess + 1 > low) low = guess + 1;
        } else {
            puts(low <= guess && guess <= high ? "Stan may be honest" : "Stan is dishonest");
            low = 1;
            high = 10;
        }
    }
    return 0;
}
