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

    static final long MOD = 1000000007;
    static long choose(long n,int k) {
        if (n < k) return 0; long answer = 1;
        long[] inverse = {1,1,500000004,166666668};
        for (int i = 0; i < k; i++) answer = answer * (n-i) % MOD;
        return answer * inverse[k] % MOD;
    }

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        int limit = 100000; boolean[] composite = new boolean[limit+1]; composite[0] = composite[1] = true;
        for (int p = 2; p*p <= limit; p++) if (!composite[p]) for (int v = p*p; v <= limit; v += p) composite[v] = true;
        long[] pc = new long[limit+1], ps = new long[limit+1], tc = new long[limit+1], ts = new long[limit+1];
        for (int v = 1; v <= limit; v++) {
            boolean prime = !composite[v], twin = v >= 3 && prime && !composite[v-2];
            pc[v] = pc[v-1] + (prime?1:0); ps[v] = ps[v-1] + (prime?v:0);
            tc[v] = tc[v-1] + (twin?1:0); ts[v] = ts[v-1] + (twin?v:0);
        }
        int tests = (int)in.next(); StringBuilder out = new StringBuilder();
        for (int test = 1; test <= tests; test++) {
            int n = (int)in.next(); long m = in.next();
            long[] supports = {0,n,n*pc[n-1]-ps[n-1],2*(n*tc[n-1]-ts[n-1]),Math.max(0,n-7)};
            long answer = 0;
            for (int size = 1; size <= 4; size++) answer = (answer + supports[size] % MOD * choose(m-1,size-1)) % MOD;
            out.append("Case ").append(test).append(": ").append(answer).append('\n');
        }
        System.out.print(out);
    }
}
