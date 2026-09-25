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
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int length;
        while ((length = fs.nextInt()) > 0) {
            int n = fs.nextInt(); int[] cut = new int[n + 2];
            cut[n + 1] = length;
            for (int i = 1; i <= n; i++) cut[i] = fs.nextInt();
            int[][] dp = new int[n + 2][n + 2];
            for (int gap = 2; gap <= n + 1; gap++) {
                for (int left = 0; left + gap <= n + 1; left++) {
                    int right = left + gap;
                    dp[left][right] = Integer.MAX_VALUE;
                    for (int first = left + 1; first < right; first++) {
                        int cost = cut[right] - cut[left] + dp[left][first] + dp[first][right];
                        dp[left][right] = Math.min(dp[left][right], cost);
                    }
                }
            }
            out.append("The minimum cutting is ").append(dp[0][n + 1]).append(".\n");
        }
        System.out.print(out);
    }
}
