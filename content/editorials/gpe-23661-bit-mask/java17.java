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
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        long n;
        while ((n = fs.nextLong()) >= 0) {
            long lower = fs.nextLong(), upper = fs.nextLong(), mask = 0;
            for (int i = 31; i >= 0; i--) {
                long bit = 1L << i;
                if ((n & bit) == 0) {
                    if ((mask | bit) <= upper) mask |= bit;
                } else if ((mask | (bit - 1)) < lower) mask |= bit;
            }
            out.append(mask).append('\n');
        }
        System.out.print(out);
    }
}
