import java.io.*;
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
    static int[] parent, size;
    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int caseNo = 0;
        while (true) {
            int n = fs.nextInt(); if (n < 0) break;
            int m = fs.nextInt(); if (n == 0 && m == 0) break;
            parent = new int[n + 1]; size = new int[n + 1];
            for (int i = 1; i <= n; i++) { parent[i] = i; size[i] = 1; }
            int groups = n;
            for (int i = 0; i < m; i++) {
                int a = find(fs.nextInt()), b = find(fs.nextInt());
                if (a != b) {
                    if (size[a] < size[b]) { int tmp = a; a = b; b = tmp; }
                    parent[b] = a; size[a] += size[b]; groups--;
                }
            }
            out.append("Case ").append(++caseNo).append(": ").append(groups).append('\n');
        }
        System.out.print(out);
    }
}
