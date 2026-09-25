import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        while (input.hasNextLong()) {
            long count = input.nextLong();
            long row = (count + 1) / 2;
            long last = 2 * row * row - 1;
            System.out.println(3 * last - 6);
        }
    }
}
