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

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        java.math.BigInteger[] moves = new java.math.BigInteger[10001]; moves[0] = java.math.BigInteger.ZERO;
        java.math.BigInteger increment = java.math.BigInteger.ONE; int block = 1, left = 1;
        for (int n = 1; n <= 10000; n++) {
            moves[n] = moves[n-1].add(increment);
            if (--left == 0) { increment = increment.shiftLeft(1); left = ++block; }
        }
        StringBuilder out = new StringBuilder();
        for (long value; (value = in.next()) != Long.MIN_VALUE;) out.append(moves[(int)value]).append('\n');
        System.out.print(out);
    }
}
