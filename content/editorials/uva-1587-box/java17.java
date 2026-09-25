import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int[][] faces = new int[6][2];
            for (int i = 0; i < 6; ++i) {
                int a = input.nextInt(), b = input.nextInt();
                faces[i][0] = Math.min(a, b);
                faces[i][1] = Math.max(a, b);
            }
            Arrays.sort(faces, (x, y) -> x[0] != y[0] ? Integer.compare(x[0],y[0]) : Integer.compare(x[1],y[1]));
            boolean pairs = Arrays.equals(faces[0],faces[1]) && Arrays.equals(faces[2],faces[3])
                         && Arrays.equals(faces[4],faces[5]);
            boolean edges = faces[0][0] == faces[2][0] && faces[0][1] == faces[4][0]
                         && faces[2][1] == faces[4][1];
            output.append(pairs && edges ? "POSSIBLE\n" : "IMPOSSIBLE\n");
        }
        System.out.print(output);
    }
}
