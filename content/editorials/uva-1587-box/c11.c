#include <stdio.h>
#include <stdlib.h>

typedef struct { int short_side, long_side; } Face;
static int compare(const void *a, const void *b) {
    const Face *x = a, *y = b;
    if (x->short_side != y->short_side) return (x->short_side > y->short_side) - (x->short_side < y->short_side);
    return (x->long_side > y->long_side) - (x->long_side < y->long_side);
}
static int equal(Face a, Face b) {
    return a.short_side == b.short_side && a.long_side == b.long_side;
}
int main(void) {
    int a, b;
    while (scanf("%d %d", &a, &b) == 2) {
        Face faces[6];
        faces[0] = (Face){a < b ? a : b, a > b ? a : b};
        for (int i = 1; i < 6; ++i) {
            scanf("%d %d", &a, &b);
            faces[i] = (Face){a < b ? a : b, a > b ? a : b};
        }
        qsort(faces, 6, sizeof(Face), compare);
        int pairs = equal(faces[0],faces[1]) && equal(faces[2],faces[3]) && equal(faces[4],faces[5]);
        int edges = faces[0].short_side == faces[2].short_side
                 && faces[0].long_side == faces[4].short_side
                 && faces[2].long_side == faces[4].long_side;
        puts(pairs && edges ? "POSSIBLE" : "IMPOSSIBLE");
    }
    return 0;
}
