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
        String digits = "0123456789ABCDEF";
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String source;
        while ((source = fs.next()) != null) {
            int from = Integer.parseInt(fs.next()), to = Integer.parseInt(fs.next());
            long modulus = 1, value = 0;
            for (int i = 0; i < 7; i++) modulus *= to;
            for (int i = 0; i < source.length(); i++)
                value = (value * from + digits.indexOf(source.charAt(i))) % modulus;
            char[] result = new char[7];
            for (int i = 6; i >= 0; i--) {
                result[i] = digits.charAt((int)(value % to));
                value /= to;
            }
            out.append(result).append('\n');
        }
        System.out.print(out);
    }
}
