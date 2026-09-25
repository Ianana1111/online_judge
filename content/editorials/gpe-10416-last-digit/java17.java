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
        int[] prefix = new int[100];
        for (int i = 1; i < 100; i++) {
            int term = 1;
            for (int e = 0; e < i; e++) term = term * (i % 10) % 10;
            prefix[i] = (prefix[i - 1] + term) % 10;
        }
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String number;
        while ((number = fs.next()) != null) {
            int remainder = 0; boolean nonzero = false;
            for (int i = 0; i < number.length(); i++) {
                int digit = number.charAt(i) - '0';
                if (digit != 0) nonzero = true;
                remainder = (remainder * 10 + digit) % 100;
            }
            if (!nonzero) break;
            out.append(prefix[remainder]).append('\n');
        }
        System.out.print(out);
    }
}
