import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output = new StringBuilder();
        int test = 0;
        String header;
        while ((header = input.readLine()) != null) {
            int lines = Integer.parseInt(header.trim());
            if (lines == 0) break;
            char[][] screen = new char[10][10];
            for (char[] line : screen) Arrays.fill(line, ' ');
            int row = 0, col = 0;
            boolean insert = false;
            for (int i = 0; i < lines; i++) {
                String line = input.readLine();
                for (int at = 0; at < line.length(); at++) {
                    char ch = line.charAt(at);
                    if (ch == '^') {
                        char command = line.charAt(++at);
                        if (command >= '0' && command <= '9') {
                            row = command - '0';
                            col = line.charAt(++at) - '0';
                            continue;
                        }
                        if (command == 'b') col = 0;
                        else if (command == 'c') {
                            for (char[] screenLine : screen) Arrays.fill(screenLine, ' ');
                        } else if (command == 'd') row = Math.min(9, row + 1);
                        else if (command == 'e') Arrays.fill(screen[row], col, 10, ' ');
                        else if (command == 'h') row = col = 0;
                        else if (command == 'i') insert = true;
                        else if (command == 'l') col = Math.max(0, col - 1);
                        else if (command == 'o') insert = false;
                        else if (command == 'r') col = Math.min(9, col + 1);
                        else if (command == 'u') row = Math.max(0, row - 1);
                        if (command != '^') continue;
                        ch = '^';
                    }
                    if (insert)
                        for (int c = 9; c > col; c--) screen[row][c] = screen[row][c - 1];
                    screen[row][col] = ch;
                    col = Math.min(9, col + 1);
                }
            }
            output.append("Case ").append(++test).append("\n+----------+\n");
            for (char[] screenLine : screen)
                output.append('|').append(screenLine).append("|\n");
            output.append("+----------+\n");
        }
        System.out.print(output);
    }
}
