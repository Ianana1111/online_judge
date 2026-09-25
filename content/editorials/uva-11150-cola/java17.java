import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        while (input.hasNextInt()) {
            int bottles = input.nextInt();
            System.out.println(bottles + bottles / 2);
        }
    }
}
