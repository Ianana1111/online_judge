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
        java.math.BigInteger[] count = new java.math.BigInteger[301]; count[0] = java.math.BigInteger.ONE;
        for (int n = 1; n <= 300; n++) count[n] = count[n-1].multiply(java.math.BigInteger.valueOf(4L*n-2)).multiply(java.math.BigInteger.valueOf(n)).divide(java.math.BigInteger.valueOf(n+1));
        StringBuilder out = new StringBuilder();
        for (long value; (value = in.next()) != Long.MIN_VALUE && value != 0;) out.append(count[(int)value]).append('\n');
        System.out.print(out);
    }
}
