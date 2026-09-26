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

    static class Heap {
        long[] data = new long[1024]; int size;
        void push(long value) {
            if (size == data.length) data = java.util.Arrays.copyOf(data, 2 * size);
            int at = size++;
            while (at > 0) { int parent = (at - 1) / 2; if (data[parent] <= value) break; data[at] = data[parent]; at = parent; }
            data[at] = value;
        }
        long pop() {
            long answer = data[0], value = data[--size]; int at = 0;
            while (2 * at + 1 < size) {
                int child = 2 * at + 1;
                if (child + 1 < size && data[child + 1] < data[child]) child++;
                if (data[child] >= value) break;
                data[at] = data[child]; at = child;
            }
            if (size > 0) data[at] = value;
            return answer;
        }
    }

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        int tests = (int)in.next();
        java.io.PrintWriter out = new java.io.PrintWriter(System.out);
        while (tests-- > 0) {
            int rows = (int)in.next(), cols = (int)in.next(), count = rows * cols;
            byte[] weight = new byte[count]; int[] distance = new int[count];
            java.util.Arrays.fill(distance, Integer.MAX_VALUE);
            for (int i = 0; i < count; i++) weight[i] = (byte)in.next();
            Heap heap = new Heap(); distance[0] = weight[0]; heap.push((long)distance[0] * count);
            int[] dr = {1, 0, -1, 0}, dc = {0, 1, 0, -1};
            while (heap.size > 0) {
                long entry = heap.pop(); int cost = (int)(entry / count), node = (int)(entry % count);
                if (cost != distance[node]) continue;
                if (node == count - 1) break;
                int row = node / cols, col = node % cols;
                for (int d = 0; d < 4; d++) {
                    int r = row + dr[d], c = col + dc[d];
                    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
                    int next = r * cols + c, candidate = cost + weight[next];
                    if (candidate < distance[next]) { distance[next] = candidate; heap.push((long)candidate * count + next); }
                }
            }
            out.println(distance[count - 1]);
        }
        out.flush();
    }
}
