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
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int n;
        while ((n = fs.nextInt()) > 0) {
            int[] weight = new int[n], load = new int[n];
            for (int i = 0; i < n; i++) { weight[i] = fs.nextInt(); load[i] = fs.nextInt(); }
            int[] best = new int[n + 1]; Arrays.fill(best, 3000001); best[0] = 0;
            int height = 0;
            for (int i = n - 1; i >= 0; i--) {
                for (int h = height; h >= 0; h--) if (best[h] <= load[i]) {
                    best[h + 1] = Math.min(best[h + 1], best[h] + weight[i]);
                    height = Math.max(height, h + 1);
                }
            }
            out.append(height).append('\n');
        }
        System.out.print(out);
    }
}
