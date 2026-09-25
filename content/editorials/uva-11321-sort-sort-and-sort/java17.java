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
            int sign = 1; if (c == '-') { sign = -1; c = read(); }
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x * sign;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int n;
        while ((n = fs.nextInt()) >= 0) {
            int mod = fs.nextInt(); out.append(n).append(' ').append(mod).append('\n');
            if (n == 0 && mod == 0) break;
            Integer[] values = new Integer[n];
            for (int i = 0; i < n; i++) values[i] = fs.nextInt();
            Arrays.sort(values, (a, b) -> {
                int ra = a % mod, rb = b % mod;
                if (ra != rb) return Integer.compare(ra, rb);
                boolean oddA = a % 2 != 0, oddB = b % 2 != 0;
                if (oddA != oddB) return oddA ? -1 : 1;
                return oddA ? Integer.compare(b, a) : Integer.compare(a, b);
            });
            for (int value : values) out.append(value).append('\n');
        }
        System.out.print(out);
    }
}
