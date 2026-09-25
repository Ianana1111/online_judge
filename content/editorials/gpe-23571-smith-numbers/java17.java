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
    static int digitSum(long value) {
        int sum = 0;
        while (value > 0) { sum += value % 10; value /= 10; }
        return sum;
    }
    static boolean smith(long value) {
        long remaining = value; int sum = 0, factors = 0;
        for (long divisor = 2; divisor * divisor <= remaining; divisor++) {
            while (remaining % divisor == 0) {
                remaining /= divisor; sum += digitSum(divisor); factors++;
            }
        }
        if (remaining > 1) { sum += digitSum(remaining); factors++; }
        return factors > 1 && sum == digitSum(value);
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = (int)fs.nextLong();
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            long value = fs.nextLong() + 1;
            while (!smith(value)) value++;
            out.append(value).append('\n');
        }
        System.out.print(out);
    }
}
