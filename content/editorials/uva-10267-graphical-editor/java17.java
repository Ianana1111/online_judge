import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output = new StringBuilder();
        char[][] image = new char[0][0];
        int width = 0, height = 0;
        String line;
        while ((line = input.readLine()) != null) {
            String[] parts = line.trim().split("\\s+");
            if (parts.length == 0 || parts[0].isEmpty()) continue;
            String op = parts[0];
            if (op.equals("X")) break;
            if (op.equals("I")) {
                width = Integer.parseInt(parts[1]);
                height = Integer.parseInt(parts[2]);
                image = new char[height][width];
                for (char[] row : image) Arrays.fill(row, 'O');
            } else if (op.equals("C")) {
                for (char[] row : image) Arrays.fill(row, 'O');
            } else if (op.equals("S")) {
                output.append(parts[1]).append('\n');
                for (char[] row : image) output.append(row).append('\n');
            } else if (op.equals("L")) {
                int x = Integer.parseInt(parts[1]), y = Integer.parseInt(parts[2]);
                image[y - 1][x - 1] = parts[3].charAt(0);
            } else if (op.equals("V")) {
                int x = Integer.parseInt(parts[1]), y1 = Integer.parseInt(parts[2]), y2 = Integer.parseInt(parts[3]);
                for (int y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
                    image[y - 1][x - 1] = parts[4].charAt(0);
            } else if (op.equals("H")) {
                int x1 = Integer.parseInt(parts[1]), x2 = Integer.parseInt(parts[2]), y = Integer.parseInt(parts[3]);
                for (int x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
                    image[y - 1][x - 1] = parts[4].charAt(0);
            } else if (op.equals("K")) {
                int x1 = Integer.parseInt(parts[1]), y1 = Integer.parseInt(parts[2]);
                int x2 = Integer.parseInt(parts[3]), y2 = Integer.parseInt(parts[4]);
                for (int y = y1 - 1; y < y2; y++)
                    for (int x = x1 - 1; x < x2; x++) image[y][x] = parts[5].charAt(0);
            } else if (op.equals("F")) {
                int x = Integer.parseInt(parts[1]) - 1, y = Integer.parseInt(parts[2]) - 1;
                char color = parts[3].charAt(0), old = image[y][x];
                if (old == color) continue;
                int[] queue = new int[width * height];
                int head = 0, tail = 0;
                queue[tail++] = y * width + x;
                image[y][x] = color;
                int[] dy = {-1, 1, 0, 0}, dx = {0, 0, -1, 1};
                while (head < tail) {
                    int cell = queue[head++], cy = cell / width, cx = cell % width;
                    for (int d = 0; d < 4; d++) {
                        int ny = cy + dy[d], nx = cx + dx[d];
                        if (ny < 0 || ny >= height || nx < 0 || nx >= width || image[ny][nx] != old) continue;
                        image[ny][nx] = color;
                        queue[tail++] = ny * width + nx;
                    }
                }
            }
        }
        System.out.print(output);
    }
}
