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
    }
    public static void main(String[] args) throws Exception {
        long[][] choose = new long[27][6];
        for (int n = 0; n <= 26; n++) {
            choose[n][0] = 1;
            for (int k = 1; k <= 5 && k <= n; k++)
                choose[n][k] = choose[n - 1][k - 1] + choose[n - 1][k];
        }
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String word;
        while ((word = fs.next()) != null) {
            int length = word.length(); boolean valid = length <= 5;
            for (int i = 0; i < length; i++) {
                char ch = word.charAt(i);
                if (ch < 'a' || ch > 'z' || (i > 0 && ch <= word.charAt(i - 1))) valid = false;
            }
            if (!valid) { out.append("0\n"); continue; }
            long answer = 1;
            for (int len = 1; len < length; len++) answer += choose[26][len];
            int previous = -1;
            for (int i = 0; i < length; i++) {
                int current = word.charAt(i) - 'a', remaining = length - i - 1;
                for (int candidate = previous + 1; candidate < current; candidate++)
                    answer += choose[25 - candidate][remaining];
                previous = current;
            }
            out.append(answer).append('\n');
        }
        System.out.print(out);
    }
}
