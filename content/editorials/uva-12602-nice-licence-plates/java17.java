import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int test = 0; test < tests; ++test) {
            String plate = input.next();
            int letters = 0;
            for (int i = 0; i < 3; ++i)
                letters = letters * 26 + plate.charAt(i) - 'A';
            int digits = Integer.parseInt(plate.substring(4));
            System.out.println(Math.abs(letters - digits) <= 100 ? "nice" : "not nice");
        }
    }
}
