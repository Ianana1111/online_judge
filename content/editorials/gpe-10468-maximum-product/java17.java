import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();int tc=0;
        while(input.hasNextInt()) {
            int n=input.nextInt();long[] a=new long[n];
            for(int i=0;i<n;++i) a[i]=input.nextLong();
            long answer=0;
            for(int left=0;left<n;++left) {
                long product=1;
                for(int right=left;right<n;++right) {
                    product*=a[right];answer=Math.max(answer,product);
                }
            }
            output.append("Case #").append(++tc).append(": The maximum product is ")
                  .append(answer).append(".\n\n");
        }
        System.out.print(output);
    }
}
