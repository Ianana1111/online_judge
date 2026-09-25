#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int parse(const char *line, int *values) {
    int count = 0; char *end;
    while (1) {
        long value = strtol(line, &end, 10);
        if (end == line) break;
        values[count++] = value; line = end;
    }
    return count;
}
int main(void) {
    char line[256]; int n = 0, correct[20], have_correct = 0;
    while (fgets(line, sizeof(line), stdin)) {
        int ranking[20], count = parse(line, ranking);
        if (count == 0) continue;
        if (count == 1) { n = ranking[0]; have_correct = 0; continue; }
        if (!have_correct) {
            memcpy(correct, ranking, n * sizeof(int)); have_correct = 1; continue;
        }
        int sequence[20], dp[20], best = 1;
        for (int event = 0; event < n; event++) sequence[ranking[event] - 1] = correct[event];
        for (int i = 0; i < n; i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++) if (sequence[j] < sequence[i] && dp[j] + 1 > dp[i])
                dp[i] = dp[j] + 1;
            if (dp[i] > best) best = dp[i];
        }
        printf("%d\n", best);
    }
    return 0;
}
