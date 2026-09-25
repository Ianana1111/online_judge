import java.util.Arrays;
import java.util.Scanner;
class Main {
    static class Job {
        long time,fine;int id;
        Job(long time,long fine,int id) {this.time=time;this.fine=fine;this.id=id;}
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        for(int tc=0;tc<tests;++tc) {
            int n=input.nextInt();Job[] jobs=new Job[n];
            for(int i=0;i<n;++i) jobs[i]=new Job(input.nextLong(),input.nextLong(),i+1);
            Arrays.sort(jobs,(a,b)->{
                long left=a.time*b.fine,right=b.time*a.fine;
                return left!=right?Long.compare(left,right):Integer.compare(a.id,b.id);
            });
            if(tc>0) output.append('\n');
            for(int i=0;i<n;++i) {
                if(i>0) output.append(' ');
                output.append(jobs[i].id);
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
