#include <stdio.h>

int main(void) {
    int target, case_number = 0;
    while (scanf("%d", &target) == 1 && target > 0) {
        int capacity = 1, pastes = 0;
        while (capacity < target) {
            capacity *= 2;
            ++pastes;
        }
        printf("Case %d: %d\n", ++case_number, pastes);
    }
    return 0;
}
