import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int test = 0; test < tests; ++test) {
            int count = input.nextInt();
            int left = 100, right = -1;
            for (int i = 0; i < count; ++i) {
                int position = input.nextInt();
                if (position < left) left = position;
                if (position > right) right = position;
            }
            System.out.println(2 * (right - left));
        }
    }
}
