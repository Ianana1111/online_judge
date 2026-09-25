import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder answers = new StringBuilder();
        int caseNumber = 0;
        while (input.hasNextInt()) {
            int count = input.nextInt();
            if (count == 0) break;
            int[] heights = new int[count];
            int total = 0;
            for (int i = 0; i < count; ++i) {
                heights[i] = input.nextInt();
                total += heights[i];
            }
            int target = total / count, moves = 0;
            for (int height : heights)
                if (height > target) moves += height - target;
            answers.append("Set #").append(++caseNumber).append('\n')
                .append("The minimum number of moves is ").append(moves).append(".\n\n");
        }
        System.out.print(answers);
    }
}
