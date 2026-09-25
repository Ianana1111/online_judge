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
        int[] primes = {2,3,5,7};
        for (int tc = 0; tc < tests; tc++) {
            long n = fs.nextLong();
            if (n < 2) { out.append(n).append('\n'); continue; }
            int[] exponent = new int[4]; long rest = n;
            for (int i = 0; i < 4; i++) while (rest % primes[i] == 0) {
                exponent[i]++; rest /= primes[i];
            }
            if (rest != 1) { out.append("-1\n"); continue; }
            String best = null;
            for (int sixes = 0; sixes <= Math.min(exponent[0], exponent[1]); sixes++) {
                int twos = exponent[0] - sixes, threes = exponent[1] - sixes;
                StringBuilder digits = new StringBuilder();
                for (int i = 0; i < sixes; i++) digits.append('6');
                for (int i = 0; i < exponent[2]; i++) digits.append('5');
                for (int i = 0; i < exponent[3]; i++) digits.append('7');
                for (int i = 0; i < twos / 3; i++) digits.append('8');
                if (twos % 3 != 0) digits.append(twos % 3 == 2 ? '4' : '2');
                for (int i = 0; i < threes / 2; i++) digits.append('9');
                if (threes % 2 != 0) digits.append('3');
                char[] chars = digits.toString().toCharArray(); Arrays.sort(chars);
                String candidate = new String(chars);
                if (best == null || candidate.length() < best.length()
                        || (candidate.length() == best.length() && candidate.compareTo(best) < 0)) best = candidate;
            }
            out.append(best).append('\n');
        }
        System.out.print(out);
    }
}
