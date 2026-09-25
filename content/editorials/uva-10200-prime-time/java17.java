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
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    public static void main(String[] args) throws Exception {
        boolean[] composite = new boolean[10002];
        ArrayList<Integer> primes = new ArrayList<>();
        for (int value = 2; value <= 10001; value++) if (!composite[value]) {
            primes.add(value);
            if (value <= 100) for (int multiple = value * value; multiple <= 10001; multiple += value)
                composite[multiple] = true;
        }
        int[] prefix = new int[10002];
        for (int n = 0; n <= 10000; n++) {
            int value = n * n + n + 41;
            boolean prime = true;
            for (int divisor : primes) {
                if ((long)divisor * divisor > value) break;
                if (value % divisor == 0) { prime = false; break; }
            }
            prefix[n + 1] = prefix[n] + (prime ? 1 : 0);
        }
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int a;
        while ((a = fs.nextInt()) >= 0) {
            int b = fs.nextInt();
            long numerator = 10000L * (prefix[b + 1] - prefix[a]);
            long denominator = b - a + 1;
            long hundredths = (2 * numerator + denominator) / (2 * denominator);
            out.append(hundredths / 100).append('.');
            if (hundredths % 100 < 10) out.append('0');
            out.append(hundredths % 100).append('\n');
        }
        System.out.print(out);
    }
}
