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
    static long[] fibonacci(long n, long mod) {
        if (n == 0) return new long[]{0, 1 % mod};
        long[] half = fibonacci(n / 2, mod);
        long a = half[0], b = half[1];
        long c = a * ((2 * b - a + mod) % mod) % mod;
        long d = (a * a + b * b) % mod;
        return n % 2 == 0 ? new long[]{c, d} : new long[]{d, (c + d) % mod};
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        long n;
        while ((n = fs.nextLong()) >= 0) {
            int m = (int)fs.nextLong();
            out.append(fibonacci(n, 1L << m)[0]).append('\n');
        }
        System.out.print(out);
    }
}
