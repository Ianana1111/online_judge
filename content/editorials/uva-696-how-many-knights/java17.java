import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int rows = input.nextInt(), columns = input.nextInt();
            if (rows == 0 && columns == 0) break;
            int shorter = Math.min(rows, columns), longer = Math.max(rows, columns);
            int answer;
            if (shorter == 0) answer = 0;
            else if (shorter == 1) answer = longer;
            else if (shorter == 2) answer = 4 * (longer / 4) + Math.min(4, 2 * (longer % 4));
            else answer = (rows * columns + 1) / 2;
            output.append(answer).append(" knights may be placed on a ").append(rows)
                  .append(" row ").append(columns).append(" column board.\n");
        }
        System.out.print(output);
    }
}
