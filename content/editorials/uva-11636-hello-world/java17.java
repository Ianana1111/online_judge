import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int caseNumber = 0;
        while (input.hasNextInt()) {
            int target = input.nextInt();
            if (target <= 0) break;
            int capacity = 1, pastes = 0;
            while (capacity < target) {
                capacity *= 2;
                ++pastes;
            }
            System.out.println("Case " + (++caseNumber) + ": " + pastes);
        }
    }
}
