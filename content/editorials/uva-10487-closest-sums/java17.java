import java.util.Arrays;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();int tc=0;
        while(input.hasNextInt()) {
            int n=input.nextInt();if(n==0) break;
            long[] a=new long[n];for(int i=0;i<n;++i) a[i]=input.nextLong();
            long[] sums=new long[n*(n-1)/2];int at=0;
            for(int i=0;i<n;++i) for(int j=i+1;j<n;++j) sums[at++]=a[i]+a[j];
            Arrays.sort(sums);output.append("Case ").append(++tc).append(":\n");
            int queries=input.nextInt();
            while(queries-->0) {
                long target=input.nextLong();int left=0,right=sums.length;
                while(left<right) {
                    int middle=(left+right)/2;
                    if(sums[middle]<target) left=middle+1;
                    else right=middle;
                }
                long answer=left==sums.length?sums[sums.length-1]:sums[left];
                if(left>0 && Math.abs(sums[left-1]-target)<Math.abs(answer-target)) answer=sums[left-1];
                output.append("Closest sum to ").append(target).append(" is ").append(answer).append(".\n");
            }
        }
        System.out.print(output);
    }
}
