import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder answers = new StringBuilder();
        while (input.hasNextInt()) {
            int queries = input.nextInt();
            if (queries == 0) break;
            int centerX = input.nextInt();
            int centerY = input.nextInt();
            for (int i = 0; i < queries; ++i) {
                int x = input.nextInt();
                int y = input.nextInt();
                if (x == centerX || y == centerY) answers.append("divisa");
                else answers.append(y > centerY ? 'N' : 'S').append(x > centerX ? 'E' : 'O');
                answers.append('\n');
            }
        }
        System.out.print(answers);
    }
}
