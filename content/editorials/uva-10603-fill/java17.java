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
        StringBuilder out = new StringBuilder();
        while (tests-- > 0) {
            int[] cap = {(int)in.next(), (int)in.next(), (int)in.next()}; int target = (int)in.next();
            int width = cap[1] + 1, count = (cap[0] + 1) * width;
            int[] distance = new int[count], best = new int[201];
            java.util.Arrays.fill(distance, Integer.MAX_VALUE); java.util.Arrays.fill(best, Integer.MAX_VALUE);
            Heap heap = new Heap(); distance[0] = 0; heap.push(0);
            while (heap.size > 0) {
                long entry = heap.pop(); int cost = (int)(entry / count), node = (int)(entry % count);
                if (cost != distance[node]) continue;
                int[] water = {node / width, node % width, cap[2] - node / width - node % width};
                for (int volume : water) best[volume] = Math.min(best[volume], cost);
                for (int from = 0; from < 3; from++) for (int to = 0; to < 3; to++) if (from != to) {
                    int amount = Math.min(water[from], cap[to] - water[to]); if (amount == 0) continue;
                    int[] next = water.clone(); next[from] -= amount; next[to] += amount;
                    int id = next[0] * width + next[1], candidate = cost + amount;
                    if (candidate < distance[id]) { distance[id] = candidate; heap.push((long)candidate * count + id); }
                }
            }
            for (int volume = target; volume >= 0; volume--) if (best[volume] != Integer.MAX_VALUE) {
                out.append(best[volume]).append(' ').append(volume).append('\n'); break;
            }
        }
        System.out.print(out);
    }
}
