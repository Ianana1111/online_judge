import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        while (input.hasNextLong()) {
            long cuts = input.nextLong();
            if (cuts < 0) break;
            System.out.println(1 + cuts * (cuts + 1) / 2);
        }
    }
}
