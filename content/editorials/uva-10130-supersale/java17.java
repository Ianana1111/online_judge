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
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = fs.nextInt();
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            int n = fs.nextInt(); int[] best = new int[31];
            for (int i = 0; i < n; i++) {
                int price = fs.nextInt(), weight = fs.nextInt();
                for (int capacity = 30; capacity >= weight; capacity--)
                    best[capacity] = Math.max(best[capacity], best[capacity - weight] + price);
            }
            int people = fs.nextInt(), total = 0;
            for (int i = 0; i < people; i++) total += best[fs.nextInt()];
            out.append(total).append('\n');
        }
        System.out.print(out);
    }
}
