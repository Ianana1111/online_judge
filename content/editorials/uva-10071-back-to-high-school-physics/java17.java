import java.io.BufferedInputStream;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(new BufferedInputStream(System.in));
        while (input.hasNextLong()) {
            long velocity = input.nextLong();
            long time = input.nextLong();
            System.out.println(2 * velocity * time);
        }
    }
}
