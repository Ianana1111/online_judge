import java.io.*;
import java.util.*;
public class Main {
    static class FastScanner {
        private final InputStream in = System.in;
        private final byte[] buf = new byte[1 << 16];
        private int ptr, len;
        int read() throws IOException {
            if (ptr >= len) { len = in.read(buf); ptr = 0; if (len < 0) return -1; }
            return buf[ptr++];
        }
        int nextInt() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return -1;
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int n;
        while ((n = fs.nextInt()) >= 0) {
            ArrayDeque<Integer> stack = new ArrayDeque<>(), queue = new ArrayDeque<>();
            PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());
            boolean stackOk = true, queueOk = true, heapOk = true;
            for (int i = 0; i < n; i++) {
                int op = fs.nextInt(), x = fs.nextInt();
                if (op == 1) { stack.push(x); queue.add(x); heap.add(x); }
                else {
                    if (stack.isEmpty() || stack.peek() != x) stackOk = false;
                    if (queue.isEmpty() || queue.peek() != x) queueOk = false;
                    if (heap.isEmpty() || heap.peek() != x) heapOk = false;
                    if (!stack.isEmpty()) stack.pop();
                    if (!queue.isEmpty()) queue.remove();
                    if (!heap.isEmpty()) heap.remove();
                }
            }
            int matches = (stackOk ? 1 : 0) + (queueOk ? 1 : 0) + (heapOk ? 1 : 0);
            out.append(matches == 0 ? "impossible" : matches > 1 ? "not sure"
                    : stackOk ? "stack" : queueOk ? "queue" : "priority queue").append('\n');
        }
        System.out.print(out);
    }
}
