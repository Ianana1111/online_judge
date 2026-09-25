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
            int sign = 1; if (c == '-') { sign = -1; c = read(); }
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x * sign;
        }
    }
    static int mod(int value, int k) { int r = value % k; return r < 0 ? r + k : r; }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = fs.nextInt();
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < tests; t++) {
            int n = fs.nextInt(), k = fs.nextInt();
            boolean[] possible = new boolean[k]; possible[mod(fs.nextInt(), k)] = true;
            for (int i = 1; i < n; i++) {
                int value = mod(fs.nextInt(), k); boolean[] next = new boolean[k];
                for (int r = 0; r < k; r++) if (possible[r]) {
                    next[(r + value) % k] = true;
                    next[mod(r - value, k)] = true;
                }
                possible = next;
            }
            out.append(possible[0] ? "Divisible" : "Not divisible").append('\n');
        }
        System.out.print(out);
    }
}
