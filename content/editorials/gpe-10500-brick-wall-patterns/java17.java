import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        long[] ways = new long[51];
        ways[0] = ways[1] = 1;
        for (int width = 2; width <= 50; ++width)
            ways[width] = ways[width - 1] + ways[width - 2];

        Scanner input = new Scanner(System.in);
        while (input.hasNextInt()) {
            int width = input.nextInt();
            if (width == 0) break;
            System.out.println(ways[width]);
        }
    }
}
