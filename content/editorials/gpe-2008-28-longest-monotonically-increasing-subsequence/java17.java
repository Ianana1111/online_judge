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
            long x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    static long[] values, path;
    static int[] up;
    static int n, found;
    static StringBuilder lines;
    static void visit(int start, int remaining, int depth) {
        if (remaining == 0) {
            found++;
            for (int j = 0; j < depth; j++) {
                if (j > 0) lines.append(' ');
                lines.append(path[j]);
            }
            lines.append('\n');
            return;
        }
        for (int i = start; i < n; i++) {
            if (up[i] == remaining && (depth == 0 || values[i] > path[depth - 1])) {
                path[depth] = values[i];
                visit(i + 1, remaining - 1, depth + 1);
            }
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = (int)fs.nextLong();
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            n = (int)fs.nextLong(); values = new long[n]; path = new long[n]; up = new int[n];
            for (int i = 0; i < n; i++) values[i] = fs.nextLong();
            int best = 0;
            for (int i = n - 1; i >= 0; i--) {
                up[i] = 1;
                for (int j = i + 1; j < n; j++)
                    if (values[j] > values[i]) up[i] = Math.max(up[i], up[j] + 1);
                best = Math.max(best, up[i]);
            }
            found = 0; lines = new StringBuilder(); visit(0, best, 0);
            out.append(found).append('\n').append(lines);
        }
        System.out.print(out);
    }
}
