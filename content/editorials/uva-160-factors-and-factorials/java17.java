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
    static void widthThree(StringBuilder out, int value) {
        if (value < 100) out.append(' ');
        if (value < 10) out.append(' ');
        out.append(value);
    }
    public static void main(String[] args) throws Exception {
        boolean[] composite = new boolean[101]; ArrayList<Integer> primes = new ArrayList<>();
        for (int p = 2; p <= 100; p++) if (!composite[p]) {
            primes.add(p);
            for (int multiple = p * p; multiple <= 100; multiple += p) composite[multiple] = true;
        }
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int n;
        while ((n = fs.nextInt()) > 0) {
            widthThree(out, n); out.append("! ="); int column = 0;
            for (int prime : primes) {
                if (prime > n) break;
                int exponent = 0;
                for (int quotient = n / prime; quotient > 0; quotient /= prime) exponent += quotient;
                if (column == 15) { out.append("\n      "); column = 0; }
                widthThree(out, exponent); column++;
            }
            out.append('\n');
        }
        System.out.print(out);
    }
}
