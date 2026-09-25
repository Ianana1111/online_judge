import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            int[] f = {1, 6, 2, 5, 3, 4};
            for (int i = 0; i < n; ++i) {
                String direction = input.next();
                int[] old = f.clone();
                if (direction.equals("north")) {
                    f[0]=old[3]; f[1]=old[2]; f[2]=old[0]; f[3]=old[1];
                } else if (direction.equals("south")) {
                    f[0]=old[2]; f[1]=old[3]; f[2]=old[1]; f[3]=old[0];
                } else if (direction.equals("west")) {
                    f[0]=old[5]; f[1]=old[4]; f[4]=old[0]; f[5]=old[1];
                } else {
                    f[0]=old[4]; f[1]=old[5]; f[4]=old[1]; f[5]=old[0];
                }
            }
            output.append(f[0]).append('\n');
        }
        System.out.print(output);
    }
}
