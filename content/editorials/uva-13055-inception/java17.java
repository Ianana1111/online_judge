import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int queries = input.nextInt();
        ArrayList<String> dreams = new ArrayList<>();
        StringBuilder answers = new StringBuilder();
        for (int i = 0; i < queries; ++i) {
            String command = input.next();
            if (command.equals("Sleep")) dreams.add(input.next());
            else if (command.equals("Kick")) {
                if (!dreams.isEmpty()) dreams.remove(dreams.size() - 1);
            } else if (command.equals("Test")) {
                answers.append(dreams.isEmpty() ? "Not in a dream" : dreams.get(dreams.size() - 1));
                answers.append('\n');
            }
        }
        System.out.print(answers);
    }
}
