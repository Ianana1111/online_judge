public class Main {

    static class Input {
        private final byte[] buffer = new byte[65536];
        private int at, size;
        int read() throws Exception {
            if (at == size) { size = System.in.read(buffer); at = 0; }
            return size < 0 ? -1 : buffer[at++];
        }
        long next() throws Exception {
            int c; do { c = read(); } while (c >= 0 && c <= 32);
            if (c < 0) return Long.MIN_VALUE;
            boolean negative = c == '-'; if (negative) c = read();
            long value = 0;
            while (c > 32) { value = value * 10 + c - '0'; c = read(); }
            return negative ? -value : value;
        }
    }

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        StringBuilder out = new StringBuilder(); int test = 0;
        while (true) {
            int n = (int)in.next(), m = (int)in.next(); if (n <= 0) break;
            int[] head = new int[n], to = new int[2*m], next = new int[2*m], cap = new int[2*m];
            java.util.Arrays.fill(head, -1);
            for (int i = 0; i < m; i++) {
                int a = (int)in.next()-1, b = (int)in.next()-1, e = 2*i;
                to[e] = b; next[e] = head[a]; head[a] = e; cap[e] = 1;
                to[e+1] = a; next[e+1] = head[b]; head[b] = e+1; cap[e+1] = 1;
            }
            int source = (int)in.next()-1, target = (int)in.next()-1, flow = 0;
            int[] parent = new int[n], queue = new int[n];
            for (int round = 0; round < 2; round++) {
                java.util.Arrays.fill(parent, -1); int front = 0, back = 0;
                queue[back++] = source; parent[source] = -2;
                while (front < back && parent[target] < 0) {
                    int u = queue[front++];
                    for (int e = head[u]; e >= 0; e = next[e]) if (cap[e] > 0 && parent[to[e]] == -1) { parent[to[e]] = e; queue[back++] = to[e]; }
                }
                if (parent[target] < 0) break;
                for (int v = target; v != source;) { int e = parent[v]; cap[e]--; cap[e^1]++; v = to[e^1]; }
                flow++;
            }
            out.append("Case ").append(++test).append(": ").append(flow == 2 ? "YES" : "NO").append('\n');
        }
        System.out.print(out);
    }
}
