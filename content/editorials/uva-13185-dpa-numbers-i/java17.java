import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int test = 0; test < tests; ++test) {
            int number = input.nextInt();
            int sum = 0;
            for (int divisor = 1; divisor < number; ++divisor)
                if (number % divisor == 0) sum += divisor;
            if (sum < number) System.out.println("deficient");
            else if (sum == number) System.out.println("perfect");
            else System.out.println("abundant");
        }
    }
}
