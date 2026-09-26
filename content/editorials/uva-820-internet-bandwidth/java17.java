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

    static int n, sink; static int[] level, following; static long[][] capacity;
    static boolean bfs(int source) {
        java.util.Arrays.fill(level, -1); int[] queue = new int[n]; int head = 0, tail = 0;
        queue[tail++] = source; level[source] = 0;
        while (head < tail) {
            int u = queue[head++];
            for (int v = 0; v < n; v++) if (capacity[u][v] > 0 && level[v] < 0) { level[v] = level[u] + 1; queue[tail++] = v; }
        }
        return level[sink] >= 0;
    }
    static long send(int u, long available) {
        if (u == sink) return available;
        for (; following[u] < n; following[u]++) {
            int v = following[u]; if (capacity[u][v] <= 0 || level[v] != level[u] + 1) continue;
            long pushed = send(v, Math.min(available, capacity[u][v]));
            if (pushed > 0) { capacity[u][v] -= pushed; capacity[v][u] += pushed; return pushed; }
        }
        return 0;
    }

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        StringBuilder out = new StringBuilder(); int test = 0;
        while (true) {
            n = (int)in.next(); if (n <= 0) break;
            int source = (int)in.next() - 1; sink = (int)in.next() - 1; int edges = (int)in.next();
            capacity = new long[n][n]; level = new int[n]; following = new int[n];
            for (int i = 0; i < edges; i++) {
                int a = (int)in.next() - 1, b = (int)in.next() - 1; long amount = in.next();
                capacity[a][b] += amount; capacity[b][a] += amount;
            }
            long total = 0;
            while (bfs(source)) {
                java.util.Arrays.fill(following, 0);
                for (long pushed; (pushed = send(source, Long.MAX_VALUE / 4)) > 0;) total += pushed;
            }
            out.append("Network ").append(++test).append("\nThe bandwidth is ").append(total).append(".\n\n");
        }
        System.out.print(out);
    }
}
