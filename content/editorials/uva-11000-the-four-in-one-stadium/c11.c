#include <stdio.h>

int main(void) {
    int years;
    while (scanf("%d", &years) == 1 && years >= 0) {
        unsigned long long male = 0, female = 1;
        for (int year = 0; year < years; ++year) {
            unsigned long long next_male = male + female;
            unsigned long long next_female = male + 1;
            male = next_male;
            female = next_female;
        }
        printf("%llu %llu\n", male, male + female);
    }
    return 0;
}
