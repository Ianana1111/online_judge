#include <stdio.h>
#include <stdlib.h>

typedef struct { long long weight, strength; } Turtle;

static int by_strength(const void *x, const void *y) {
    const Turtle *a = x, *b = y;
    if (a->strength != b->strength) return (a->strength > b->strength) - (a->strength < b->strength);
    return (a->weight > b->weight) - (a->weight < b->weight);
}

static long long heap[6000];
static int size = 0;

static void push(long long v) {
    int i = size++;
    heap[i] = v;
    while (i > 0 && heap[(i - 1) / 2] < heap[i]) {
        long long t = heap[i]; heap[i] = heap[(i - 1) / 2]; heap[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
}

static long long pop(void) {
    long long top = heap[0];
    heap[0] = heap[--size];
    for (int i = 0;;) {
        int l = 2 * i + 1, r = l + 1, big = i;
        if (l < size && heap[l] > heap[big]) big = l;
        if (r < size && heap[r] > heap[big]) big = r;
        if (big == i) break;
        long long t = heap[i]; heap[i] = heap[big]; heap[big] = t;
        i = big;
    }
    return top;
}

int main(void) {
    Turtle *turtles = malloc(sizeof(Turtle) * 6000);
    int n = 0;
    while (n < 6000 && scanf("%lld %lld", &turtles[n].weight, &turtles[n].strength) == 2) ++n;
    qsort(turtles, (size_t)n, sizeof(Turtle), by_strength);
    long long total = 0;
    for (int k = 0; k < n; ++k) {
        push(turtles[k].weight);
        total += turtles[k].weight;
        if (total > turtles[k].strength) total -= pop();
    }
    printf("%d\n", size);
    free(turtles);
    return 0;
}
