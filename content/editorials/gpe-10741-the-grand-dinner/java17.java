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
        while (true) {
            int teams = (int)in.next(), tables = (int)in.next(); if (teams <= 0) break;
            int[][] group = new int[teams][2], seats = new int[tables][2]; int[] counts = new int[teams];
            int[][] answer = new int[teams][];
            for (int i = 0; i < teams; i++) { group[i][0] = (int)in.next(); group[i][1] = i; counts[i] = group[i][0]; }
            for (int j = 0; j < tables; j++) { seats[j][0] = (int)in.next(); seats[j][1] = j+1; }
            java.util.Comparator<int[]> order = (a,b) -> a[0] != b[0] ? Integer.compare(b[0],a[0]) : Integer.compare(a[1],b[1]);
            java.util.Arrays.sort(group,order); boolean possible = true;
            for (int[] team : group) {
                java.util.Arrays.sort(seats,order); int needed = team[0];
                if (needed > tables || seats[needed-1][0] == 0) { possible = false; break; }
                answer[team[1]] = new int[needed];
                for (int j = 0; j < needed; j++) { answer[team[1]][j] = seats[j][1]; seats[j][0]--; }
            }
            if (!possible) { out.append("0\n"); continue; } out.append("1\n");
            for (int[] row : answer) {
                for (int j = 0; j < row.length; j++) { if (j > 0) out.append(' '); out.append(row[j]); }
                out.append('\n');
            }
        }
        System.out.print(out);
    }
}
