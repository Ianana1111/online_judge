import java.util.Arrays;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);
        int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            long[] a=new long[4];
            for(int i=0;i<4;++i) a[i]=input.nextLong();
            Arrays.sort(a);
            if(a[0]==a[3]) output.append("square\n");
            else if(a[0]==a[1] && a[2]==a[3]) output.append("rectangle\n");
            else if(a[0]+a[1]+a[2]>a[3]) output.append("quadrangle\n");
            else output.append("banana\n");
        }
        System.out.print(output);
    }
}
