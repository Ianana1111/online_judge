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
            long x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    static long value(long[] c, int i) {
        return c[0] * i * (long)i + c[1] * i + c[2];
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = (int)fs.nextLong();
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            long[] a = new long[3], b = new long[3];
            for (int j = 0; j < 3; j++) a[j] = fs.nextLong();
            for (int j = 0; j < 3; j++) b[j] = fs.nextLong();
            int n = (int)fs.nextLong(); int low = 0, high = n;
            while (low <= high) {
                int takeA = low + (high - low) / 2, takeB = n - takeA;
                long al = takeA > 0 ? value(a, takeA - 1) : Long.MIN_VALUE;
                long ar = takeA < n ? value(a, takeA) : Long.MAX_VALUE;
                long bl = takeB > 0 ? value(b, takeB - 1) : Long.MIN_VALUE;
                long br = takeB < n ? value(b, takeB) : Long.MAX_VALUE;
                if (al > br) high = takeA - 1;
                else if (bl > ar) low = takeA + 1;
                else { out.append(Math.max(al, bl)).append('\n'); break; }
            }
        }
        System.out.print(out);
    }
}
