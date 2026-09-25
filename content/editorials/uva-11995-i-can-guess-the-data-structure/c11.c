#include <stdio.h>
int main(void) {
    int n;
    while (scanf("%d", &n) == 1) {
        int stack[1001], queue[1001], heap[1001];
        int ns = 0, front = 0, back = 0, nh = 0;
        int stack_ok = 1, queue_ok = 1, heap_ok = 1;
        for (int i = 0; i < n; i++) {
            int op, x; scanf("%d %d", &op, &x);
            if (op == 1) { stack[ns++] = x; queue[back++] = x; heap[nh++] = x; }
            else {
                if (!ns || stack[ns - 1] != x) stack_ok = 0;
                if (front == back || queue[front] != x) queue_ok = 0;
                int largest = 0;
                for (int j = 1; j < nh; j++) if (heap[j] > heap[largest]) largest = j;
                if (!nh || heap[largest] != x) heap_ok = 0;
                if (ns) ns--;
                if (front < back) front++;
                if (nh) heap[largest] = heap[--nh];
            }
        }
        int matches = stack_ok + queue_ok + heap_ok;
        if (!matches) puts("impossible");
        else if (matches > 1) puts("not sure");
        else puts(stack_ok ? "stack" : queue_ok ? "queue" : "priority queue");
    }
    return 0;
}
