import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            long distance=input.nextLong(); distance=input.nextLong()-distance;
            if(distance==0) {output.append("0\n");continue;}
            long root=(long)Math.sqrt(distance);
            while((root+1)*(root+1)<=distance) ++root;
            while(root*root>distance) --root;
            long moves=distance==root*root ? 2*root-1 : distance<=root*root+root ? 2*root : 2*root+1;
            output.append(moves).append('\n');
        }
        System.out.print(output);
    }
}
