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
        String next() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return null;
            StringBuilder s = new StringBuilder();
            while (c > 32 && c >= 0) { s.append((char)c); c = read(); }
            return s.toString();
        }
        int nextInt() throws IOException { return Integer.parseInt(next()); }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = fs.nextInt();
        StringBuilder out = new StringBuilder();
        for (int tc = 1; tc <= tests; tc++) {
            int n = fs.nextInt(), distance = fs.nextInt();
            int[] points = new int[2 * n + 4]; int count = 0;
            points[count++] = 0; points[count++] = 0;
            for (int i = 0; i < n; i++) {
                String token = fs.next(); int position = Integer.parseInt(token.substring(2));
                points[count++] = position;
                if (token.charAt(0) == 'B') points[count++] = position;
            }
            points[count++] = distance; points[count++] = distance;
            int best = 0;
            for (int i = 2; i < count; i++) best = Math.max(best, points[i] - points[i - 2]);
            out.append("Case ").append(tc).append(": ").append(best).append('\n');
        }
        System.out.print(out);
    }
}
