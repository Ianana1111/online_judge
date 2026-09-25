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
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String token;
        while ((token = fs.next()) != null) {
            int n = Integer.parseInt(token); if (n == 0) break;
            long[] paid = new long[n]; long total = 0;
            for (int i = 0; i < n; i++) {
                String amount = fs.next(); int dot = amount.indexOf('.');
                paid[i] = Long.parseLong(amount.substring(0, dot)) * 100
                        + Long.parseLong(amount.substring(dot + 1));
                total += paid[i];
            }
            long low = total / n, high = (total + n - 1) / n;
            long give = 0, receive = 0;
            for (long value : paid) {
                if (value > high) give += value - high;
                if (value < low) receive += low - value;
            }
            long answer = Math.max(give, receive);
            out.append('$').append(answer / 100).append('.');
            if (answer % 100 < 10) out.append('0');
            out.append(answer % 100).append('\n');
        }
        System.out.print(out);
    }
}
