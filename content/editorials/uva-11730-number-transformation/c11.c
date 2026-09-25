#include <stdio.h>
static int distance[1001], queue[1001];
int main(void) {
    int start, target, case_no = 0;
    while (scanf("%d %d", &start, &target) == 2 && (start || target)) {
        for (int i = 0; i <= 1000; i++) distance[i] = -1;
        int front = 0, back = 0;
        queue[back++] = start; distance[start] = 0;
        while (front < back) {
            int value = queue[front++], remaining = value;
            int factors[10], count = 0;
            for (int p = 2; p * p <= remaining; p++) if (remaining % p == 0) {
                factors[count++] = p;
                while (remaining % p == 0) remaining /= p;
            }
            if (remaining > 1 && remaining < value) factors[count++] = remaining;
            for (int i = 0; i < count; i++) {
                int next = value + factors[i];
                if (next > target || distance[next] >= 0) continue;
                distance[next] = distance[value] + 1;
                queue[back++] = next;
            }
        }
        printf("Case %d: %d\n", ++case_no, distance[target]);
    }
    return 0;
}
