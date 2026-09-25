import java.io.BufferedInputStream;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(new BufferedInputStream(System.in));
        while (input.hasNextLong()) {
            long a = input.nextLong();
            long b = input.nextLong();
            System.out.println(Math.abs(a - b));
        }
    }
}
