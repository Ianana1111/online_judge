public class Main {

    static class Input {
        private final byte[] buffer = new byte[65536];
        private int at, size;
        int read() throws Exception {
            if (at == size) { size = System.in.read(buffer); at = 0; }
            return size < 0 ? -1 : buffer[at++];
        }
        long next() throws Exception {
            int c; do { c = read(); } while (c >= 0 && c <= 32);
            if (c < 0) return Long.MIN_VALUE;
            boolean negative = c == '-'; if (negative) c = read();
            long value = 0;
            while (c > 32) { value = value * 10 + c - '0'; c = read(); }
            return negative ? -value : value;
        }
    }

    static boolean better(long x, long y, long bx, long by) {
        long first = Math.abs(x) + Math.abs(y), second = Math.abs(bx) + Math.abs(by);
        if (first != second) return first < second;
        if ((x > y) != (bx > by)) return x <= y;
        return x != bx ? x < bx : y < by;
    }

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        StringBuilder out = new StringBuilder();
        for (long a; (a = in.next()) != Long.MIN_VALUE;) {
            long b = in.next(), r0 = a, r1 = b, x0 = 1, x1 = 0, y0 = 0, y1 = 1;
            while (r1 != 0) {
                long q = r0 / r1, r2 = r0 - q * r1, x2 = x0 - q * x1, y2 = y0 - q * y1;
                r0 = r1; r1 = r2; x0 = x1; x1 = x2; y0 = y1; y1 = y2;
            }
            long sx = b / r0, sy = a / r0, kx = Math.floorDiv(-x0, sx), ky = Math.floorDiv(y0, sy);
            long[] shifts = {0, kx, kx + 1, ky, ky + 1};
            long bx = x0, by = y0;
            for (long k : shifts) {
                long x = x0 + k * sx, y = y0 - k * sy;
                if (better(x, y, bx, by)) { bx = x; by = y; }
            }
            out.append(bx).append(' ').append(by).append(' ').append(r0).append('\n');
        }
        System.out.print(out);
    }
}
