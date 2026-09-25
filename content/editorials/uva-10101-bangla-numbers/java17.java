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
    static void appendNumber(long n, StringBuilder out) {
        if (n >= 10000000) { appendNumber(n / 10000000, out); out.append(" kuti"); n %= 10000000; }
        if (n >= 100000) { out.append(' ').append(n / 100000).append(" lakh"); n %= 100000; }
        if (n >= 1000) { out.append(' ').append(n / 1000).append(" hajar"); n %= 1000; }
        if (n >= 100) { out.append(' ').append(n / 100).append(" shata"); n %= 100; }
        if (n > 0) out.append(' ').append(n);
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int caseNo = 0; long number;
        while ((number = fs.nextLong()) >= 0) {
            String label = Integer.toString(++caseNo);
            for (int i = label.length(); i < 4; i++) out.append(' ');
            out.append(label).append('.');
            if (number == 0) out.append(" 0");
            else appendNumber(number, out);
            out.append('\n');
        }
        System.out.print(out);
    }
}
