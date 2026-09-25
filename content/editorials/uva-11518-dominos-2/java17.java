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
            if (c < 0) return -1;
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); int tests = fs.nextInt();
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < tests; t++) {
            int n = fs.nextInt(), m = fs.nextInt(), pushes = fs.nextInt();
            int[] head = new int[n + 1], to = new int[m], next = new int[m];
            java.util.Arrays.fill(head, -1);
            for (int e = 0; e < m; e++) {
                int a = fs.nextInt(), b = fs.nextInt();
                to[e] = b; next[e] = head[a]; head[a] = e;
            }
            boolean[] seen = new boolean[n + 1]; int[] queue = new int[n + 1];
            int front = 0, back = 0;
            for (int j = 0; j < pushes; j++) {
                int x = fs.nextInt();
                if (!seen[x]) { seen[x] = true; queue[back++] = x; }
            }
            while (front < back) {
                int x = queue[front++];
                for (int e = head[x]; e != -1; e = next[e]) {
                    int y = to[e];
                    if (!seen[y]) { seen[y] = true; queue[back++] = y; }
                }
            }
            out.append(back).append('\n');
        }
        System.out.print(out);
    }
}
