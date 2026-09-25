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
        long[][] count = new long[27][352]; count[0][0] = 1;
        for (int value = 1; value <= 26; value++) {
            for (int length = 26; length >= 1; length--) {
                for (int sum = 351; sum >= value; sum--)
                    count[length][sum] += count[length - 1][sum - value];
            }
        }
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int caseNo = 0, length;
        while ((length = fs.nextInt()) >= 0) {
            int sum = fs.nextInt(); if (length == 0 && sum == 0) break;
            long answer = length <= 26 && sum <= 351 ? count[length][sum] : 0;
            out.append("Case ").append(++caseNo).append(": ").append(answer).append('\n');
        }
        System.out.print(out);
    }
}
