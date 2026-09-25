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
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int caseNo = 0;
        while (true) {
            int n = (int)fs.nextLong(); if (n < 0) break;
            int m = (int)fs.nextLong(); if (n == 0 && m == 0) break;
            long[] a = new long[n + 1], b = new long[m + 1];
            for (int i = 1; i <= n; i++) a[i] = fs.nextLong();
            for (int j = 1; j <= m; j++) b[j] = fs.nextLong();
            int[][] dp = new int[n + 1][m + 1];
            for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) {
                dp[i][j] = a[i] == b[j] ? dp[i - 1][j - 1] + 1
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
            out.append("Twin Towers #").append(++caseNo).append('\n');
            out.append("Number of Tiles : ").append(dp[n][m]).append("\n\n");
        }
        System.out.print(out);
    }
}
