import java.util.Arrays;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();int tc=0;
        while(input.hasNextInt()) {
            int n=input.nextInt(),q=input.nextInt();if(n==0 && q==0) break;
            int[] marbles=new int[n];for(int i=0;i<n;++i) marbles[i]=input.nextInt();
            Arrays.sort(marbles);output.append("CASE# ").append(++tc).append(":\n");
            while(q-->0) {
                int value=input.nextInt(),left=0,right=n;
                while(left<right) {
                    int middle=(left+right)/2;
                    if(marbles[middle]<value) left=middle+1;
                    else right=middle;
                }
                output.append(value);
                if(left<n && marbles[left]==value) output.append(" found at ").append(left+1);
                else output.append(" not found");
                output.append('\n');
            }
        }
        System.out.print(output);
    }
}
