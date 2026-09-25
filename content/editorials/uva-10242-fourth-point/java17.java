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
    static long millimetres(String s) {
        int sign = 1;
        if (s.charAt(0) == '-') { sign = -1; s = s.substring(1); }
        int dot = s.indexOf('.');
        if (dot < 0) return sign * Long.parseLong(s) * 1000;
        String fraction = s.substring(dot + 1);
        while (fraction.length() < 3) fraction += "0";
        return sign * (Long.parseLong(s.substring(0, dot)) * 1000
                + Long.parseLong(fraction.substring(0, 3)));
    }
    static void appendCoordinate(StringBuilder out, long value) {
        if (value < 0) out.append('-');
        long magnitude = Math.abs(value);
        out.append(magnitude / 1000).append('.');
        long fraction = magnitude % 1000;
        if (fraction < 100) out.append('0');
        if (fraction < 10) out.append('0');
        out.append(fraction);
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String token;
        while ((token = fs.next()) != null) {
            long[][] points = new long[4][2]; points[0][0] = millimetres(token);
            for (int i = 1; i < 8; i++) points[i / 2][i % 2] = millimetres(fs.next());
            long[] common = new long[2];
            for (int i = 0; i < 2; i++) for (int j = 2; j < 4; j++) {
                if (points[i][0] == points[j][0] && points[i][1] == points[j][1]) {
                    common[0] = points[i][0]; common[1] = points[i][1];
                }
            }
            long[] answer = {-3 * common[0], -3 * common[1]};
            for (long[] point : points) { answer[0] += point[0]; answer[1] += point[1]; }
            appendCoordinate(out, answer[0]); out.append(' ');
            appendCoordinate(out, answer[1]); out.append('\n');
        }
        System.out.print(out);
    }
}
