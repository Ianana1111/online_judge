import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int[] smallest = new int[100001];
        for (int value = 1; value <= 100000; ++value) {
            int target = value;
            for (int digits = value; digits > 0; digits /= 10) target += digits % 10;
            if (target <= 100000 && smallest[target] == 0) smallest[target] = value;
        }
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        for (int test = 0; test < tests; ++test)
            System.out.println(smallest[input.nextInt()]);
    }
}
