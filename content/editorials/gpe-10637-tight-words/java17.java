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
        StringBuilder out = new StringBuilder();
        for (long first; (first = in.next()) != Long.MIN_VALUE;) {
            int k = (int)first, n = (int)in.next();
            java.math.BigInteger[] counts = new java.math.BigInteger[k+1]; java.util.Arrays.fill(counts,java.math.BigInteger.ONE);
            for (int length = 2; length <= n; length++) {
                java.math.BigInteger[] following = new java.math.BigInteger[k+1];
                for (int d = 0; d <= k; d++) {
                    following[d] = java.math.BigInteger.ZERO;
                    for (int previous = Math.max(0,d-1); previous <= Math.min(k,d+1); previous++) following[d] = following[d].add(counts[previous]);
                }
                counts = following;
            }
            java.math.BigInteger valid = java.math.BigInteger.ZERO;
            for (java.math.BigInteger count : counts) valid = valid.add(count);
            java.math.BigInteger denominator = java.math.BigInteger.valueOf(k+1).pow(n);
            int rounded = valid.multiply(java.math.BigInteger.valueOf(20000000)).add(denominator).divide(denominator.shiftLeft(1)).intValueExact();
            out.append(String.format(java.util.Locale.ROOT,"%d.%05d",rounded/100000,rounded%100000)).append('\n');
        }
        System.out.print(out);
    }
}
