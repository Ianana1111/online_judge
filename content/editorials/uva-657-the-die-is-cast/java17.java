import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;

class Main {
    private static final BufferedInputStream IN = new BufferedInputStream(System.in);
    private static String next() throws IOException {
        int c;
        do { c = IN.read(); } while (c <= ' ' && c != -1);
        if (c == -1) return null;
        StringBuilder word = new StringBuilder();
        while (c > ' ') { word.append((char)c); c = IN.read(); }
        return word.toString();
    }
    public static void main(String[] args) throws Exception {
        int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
        StringBuilder output = new StringBuilder();
        int test = 0;
        String first;
        while ((first = next()) != null) {
            int width = Integer.parseInt(first), height = Integer.parseInt(next());
            if (width == 0 && height == 0) break;
            String[] grid = new String[height];
            for (int r = 0; r < height; r++) grid[r] = next();
            boolean[][] dieSeen = new boolean[height][width], pipSeen = new boolean[height][width];
            int[] queue = new int[width * height], cells = new int[width * height];
            ArrayList<Integer> answers = new ArrayList<>();
            for (int sr = 0; sr < height; sr++) for (int sc = 0; sc < width; sc++) {
                if (grid[sr].charAt(sc) == '.' || dieSeen[sr][sc]) continue;
                int head = 0, tail = 0;
                queue[tail++] = sr * width + sc;
                dieSeen[sr][sc] = true;
                while (head < tail) {
                    int cell = queue[head++], r = cell / width, c = cell % width;
                    cells[head - 1] = cell;
                    for (int d = 0; d < 4; d++) {
                        int nr = r + dr[d], nc = c + dc[d];
                        if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
                        if (grid[nr].charAt(nc) == '.' || dieSeen[nr][nc]) continue;
                        dieSeen[nr][nc] = true;
                        queue[tail++] = nr * width + nc;
                    }
                }
                int dots = 0;
                for (int i = 0; i < tail; i++) {
                    int r = cells[i] / width, c = cells[i] % width;
                    if (grid[r].charAt(c) != 'X' || pipSeen[r][c]) continue;
                    dots++;
                    head = 0;
                    int end = 0;
                    queue[end++] = r * width + c;
                    pipSeen[r][c] = true;
                    while (head < end) {
                        int cell = queue[head++], x = cell / width, y = cell % width;
                        for (int d = 0; d < 4; d++) {
                            int nx = x + dr[d], ny = y + dc[d];
                            if (nx < 0 || nx >= height || ny < 0 || ny >= width) continue;
                            if (grid[nx].charAt(ny) != 'X' || pipSeen[nx][ny]) continue;
                            pipSeen[nx][ny] = true;
                            queue[end++] = nx * width + ny;
                        }
                    }
                }
                answers.add(dots);
            }
            Collections.sort(answers);
            output.append("Throw ").append(++test).append('\n');
            for (int i = 0; i < answers.size(); i++) {
                if (i > 0) output.append(' ');
                output.append(answers.get(i));
            }
            output.append("\n\n");
        }
        System.out.print(output);
    }
}
