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
        java.util.ArrayList<int[]> queries = new java.util.ArrayList<>();
        for (long value; (value = in.next()) != Long.MIN_VALUE;) queries.add(new int[]{(int)value, queries.size()});
        String[] answers = new String[queries.size()]; queries.sort(java.util.Comparator.comparingInt(q -> q[0]));
        int step = 0; double survival = 0, factorial = 0, survivalError = 0, factorialError = 0;
        for (int[] query : queries) {
            int n = query[0];
            while (step < n) {
                double k = ++step, term = Math.log1p(-1/(k*(k+1))) - survivalError;
                double following = survival + term; survivalError = (following-survival)-term; survival = following;
                term = Math.log10(k) - factorialError; following = factorial + term; factorialError = (following-factorial)-term; factorial = following;
            }
            double probability = n == 0 ? 0 : -Math.expm1(survival);
            long zeros = n == 0 ? 0 : (long)Math.floor(2*factorial + Math.log10((double)n+1));
            answers[query[1]] = String.format(java.util.Locale.ROOT, "%.6f %d", probability, zeros);
        }
        System.out.println(String.join("\n", answers));
    }
}
