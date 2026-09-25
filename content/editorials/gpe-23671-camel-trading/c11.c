#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
static long long evaluate(const long long *values, const char *ops, int count, char first) {
    long long answer = first == '+' ? 1 : 0, group = values[0];
    for (int i = 0; i < count - 1; i++) {
        if (ops[i] == first) {
            if (first == '+') group += values[i + 1];
            else group *= values[i + 1];
        } else {
            if (first == '+') answer *= group; else answer += group;
            group = values[i + 1];
        }
    }
    return first == '+' ? answer * group : answer + group;
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    char line[256]; fgets(line, sizeof(line), stdin);
    while (tests--) {
        do { if (!fgets(line, sizeof(line), stdin)) return 0; } while (line[0] == '\n');
        long long values[12]; char ops[12]; int count = 0, used = 0;
        char *at = line;
        while (*at) {
            while (isspace((unsigned char)*at)) at++;
            if (!isdigit((unsigned char)*at)) break;
            values[count++] = strtoll(at, &at, 10);
            while (isspace((unsigned char)*at)) at++;
            if (*at == '+' || *at == '*') ops[used++] = *at++;
            else break;
        }
        printf("The maximum and minimum are %lld and %lld.\n",
               evaluate(values, ops, count, '+'), evaluate(values, ops, count, '*'));
    }
    return 0;
}
