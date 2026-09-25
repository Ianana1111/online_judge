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
        long nextLong() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return -1;
            long x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = (int)fs.nextLong();
        StringBuilder out = new StringBuilder();
        for (int tc = 1; tc <= tests; tc++) {
            int[] cost = new int[36];
            for (int i = 0; i < 36; i++) cost[i] = (int)fs.nextLong();
            int queries = (int)fs.nextLong();
            if (tc > 1) out.append('\n');
            out.append("Case ").append(tc).append(":\n");
            for (int q = 0; q < queries; q++) {
                long number = fs.nextLong(); int best = Integer.MAX_VALUE;
                int[] bases = new int[35]; int count = 0;
                for (int base = 2; base <= 36; base++) {
                    long x = number; int total = 0;
                    do { total += cost[(int)(x % base)]; x /= base; } while (x > 0);
                    if (total < best) { best = total; count = 0; }
                    if (total == best) bases[count++] = base;
                }
                out.append("Cheapest base(s) for number ").append(number).append(':');
                for (int j = 0; j < count; j++) out.append(' ').append(bases[j]);
                out.append('\n');
            }
        }
        System.out.print(out);
    }
}
