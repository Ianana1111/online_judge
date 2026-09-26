import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    static long earliest(long a,long b){if(a<0)return b;if(b<0)return a;return Math.min(a,b);}
    static long arrive(long time,long high,long low,long deadline){
        if(time<0||time>=deadline)return -1;
        long distance=high-low;
        // Sorted coordinates imply a nonnegative mathematical distance; a negative
        // wrapped long exceeds every possible positive signed-long deadline.
        if(distance<0||distance>=deadline-time)return -1;return time+distance;
    }
    public static void main(String[]args)throws Exception{
        String token;
        while((token=next())!=null){
            int n=Integer.parseInt(token);long[]position=new long[n],deadline=new long[n],left=new long[n],right=new long[n];
            for(int i=0;i<n;i++){position[i]=Long.parseLong(next());deadline[i]=Long.parseLong(next());left[i]=right[i]=deadline[i]>0?0:-1;}
            for(int length=2;length<=n;length++)for(int l=0;l+length<=n;l++){
                int r=l+length-1;
                long nextLeft=earliest(arrive(left[l+1],position[l+1],position[l],deadline[l]),arrive(right[l+1],position[r],position[l],deadline[l]));
                long nextRight=earliest(arrive(left[l],position[r],position[l],deadline[r]),arrive(right[l],position[r],position[r-1],deadline[r]));
                left[l]=nextLeft;right[l]=nextRight;
            }
            long answer=earliest(left[0],right[0]);System.out.println(answer<0?"No solution":Long.toString(answer));
        }
    }
}
