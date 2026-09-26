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

    static int[] parent;
    static int root(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        java.io.PrintWriter out = new java.io.PrintWriter(System.out);
        for (long value; (value = in.next()) != Long.MIN_VALUE;) {
            int n = (int)value, m = (int)in.next(), capacity = n + m + 1, used = n;
            parent = new int[capacity];
            int[] size = new int[capacity], weight = new int[capacity], id = new int[n + 1];
            long[] sum = new long[capacity];
            for (int p = 0; p < capacity; p++) { parent[p] = p; weight[p] = 1; }
            for (int p = 1; p <= n; p++) { id[p] = p; size[p] = 1; sum[p] = p; }
            for (int i = 0; i < m; i++) {
                int op = (int)in.next(), p = (int)in.next(), a = root(id[p]);
                if (op == 3) { out.println(size[a] + " " + sum[a]); continue; }
                int q = (int)in.next(), b = root(id[q]);
                if (a == b) continue;
                if (op == 1) {
                    if (weight[a] < weight[b]) { int tmp = a; a = b; b = tmp; }
                    parent[b] = a; weight[a] += weight[b]; size[a] += size[b]; sum[a] += sum[b];
                } else {
                    size[a]--; sum[a] -= p; size[b]++; sum[b] += p;
                    id[p] = ++used; parent[used] = b; weight[b]++;
                }
            }
        }
        out.flush();
    }
}
