import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long rows = input.nextLong(), columns = input.nextLong();
            if (rows == 0 && columns == 0) break;
            if (rows > columns) {
                long temp = rows;
                rows = columns;
                columns = temp;
            }
            long straight = rows * columns * (rows + columns - 2);
            long diagonal = 4 * rows * (rows - 1) * (rows - 2) / 3
                          + 2 * (columns - rows + 1) * rows * (rows - 1);
            output.append(straight + diagonal).append('\n');
        }
        System.out.print(output);
    }
}
