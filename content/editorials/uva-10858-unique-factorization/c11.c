#include <stdio.h>
#include <stdlib.h>
typedef struct { int length, factor[21]; } Answer;
static Answer *answers;
static int count, capacity, path[21];
static void save(int rest, int depth) {
    if (count == capacity) { capacity *= 2; answers = realloc(answers, capacity * sizeof(Answer)); }
    answers[count].length = depth + 1;
    for (int i = 0; i < depth; i++) answers[count].factor[i] = path[i];
    answers[count].factor[depth] = rest;
    count++;
}
static void search(int rest, int minimum, int depth) {
    for (int divisor = minimum; divisor * divisor <= rest; divisor++) if (rest % divisor == 0) {
        path[depth] = divisor;
        search(rest / divisor, divisor, depth + 1);
    }
    if (depth && rest >= minimum) save(rest, depth);
}
static int compare(const void *left, const void *right) {
    const Answer *a = left, *b = right;
    int length = a->length < b->length ? a->length : b->length;
    for (int i = 0; i < length; i++) if (a->factor[i] != b->factor[i])
        return a->factor[i] < b->factor[i] ? -1 : 1;
    return a->length - b->length;
}
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n) {
        count = 0; capacity = 128; answers = malloc(capacity * sizeof(Answer));
        search(n, 2, 0);
        qsort(answers, count, sizeof(Answer), compare);
        printf("%d\n", count);
        for (int i = 0; i < count; i++) {
            for (int j = 0; j < answers[i].length; j++) {
                if (j) putchar(' ');
                printf("%d", answers[i].factor[j]);
            }
            putchar('\n');
        }
        free(answers);
    }
    return 0;
}
