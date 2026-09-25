import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int test = 0; test < tests; ++test) {
            int depth = input.nextInt();
            int number = input.nextInt();
            int node = 1;
            for (int level = 1; level < depth; ++level) {
                if (number % 2 != 0) {
                    node *= 2;
                    number = (number + 1) / 2;
                } else {
                    node = node * 2 + 1;
                    number /= 2;
                }
            }
            System.out.println(node);
        }
    }
}
