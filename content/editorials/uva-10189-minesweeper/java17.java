import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        int field = 0;
        while (input.hasNextInt()) {
            int rows = input.nextInt(), cols = input.nextInt();
            if (rows == 0 && cols == 0) break;
            String[] grid = new String[rows];
            for (int r = 0; r < rows; ++r) grid[r] = input.next();
            if (field > 0) output.append('\n');
            output.append("Field #").append(++field).append(":\n");
            for (int r = 0; r < rows; ++r) {
                for (int c = 0; c < cols; ++c) {
                    if (grid[r].charAt(c) == '*') { output.append('*'); continue; }
                    int count = 0;
                    for (int dr = -1; dr <= 1; ++dr)
                        for (int dc = -1; dc <= 1; ++dc) {
                            int nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr].charAt(nc) == '*') ++count;
                        }
                    output.append(count);
                }
                output.append('\n');
            }
        }
        System.out.print(output);
    }
}
