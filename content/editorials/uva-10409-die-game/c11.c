#include <stdio.h>
#include <string.h>
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        int f[6] = {1, 6, 2, 5, 3, 4};
        for (int i = 0; i < n; ++i) {
            char direction[8];
            scanf("%7s", direction);
            int old[6];
            memcpy(old, f, sizeof(f));
            if (strcmp(direction, "north") == 0) {
                f[0]=old[3]; f[1]=old[2]; f[2]=old[0]; f[3]=old[1];
            } else if (strcmp(direction, "south") == 0) {
                f[0]=old[2]; f[1]=old[3]; f[2]=old[1]; f[3]=old[0];
            } else if (strcmp(direction, "west") == 0) {
                f[0]=old[5]; f[1]=old[4]; f[4]=old[0]; f[5]=old[1];
            } else {
                f[0]=old[4]; f[1]=old[5]; f[4]=old[1]; f[5]=old[0];
            }
        }
        printf("%d\n", f[0]);
    }
    return 0;
}
