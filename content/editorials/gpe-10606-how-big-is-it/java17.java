import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.Locale;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(input.readLine());return tokens.nextToken();}
    static int n;static double[]radius,position;static double[][]gap;static int[]order;static boolean[]used;static double best;
    static void search(int count,double width){
        if(width>=best)return;if(count==n){best=width;return;}
        for(int i=0;i<n;i++){
            if(used[i]||(i>0&&radius[i]==radius[i-1]&&!used[i-1]))continue;
            double center=radius[i];for(int j=0;j<count;j++)center=Math.max(center,position[j]+gap[i][order[j]]);
            used[i]=true;order[count]=i;position[count]=center;
            search(count+1,Math.max(width,center+radius[i]));used[i]=false;
        }
    }
    public static void main(String[]args)throws Exception{
        int tests=Integer.parseInt(next());
        while(tests-->0){
            n=Integer.parseInt(next());radius=new double[n];position=new double[n];order=new int[n];used=new boolean[n];gap=new double[n][n];best=0;
            for(int i=0;i<n;i++){radius[i]=Double.parseDouble(next());best+=2*radius[i];}Arrays.sort(radius);
            for(int i=0;i<n;i++)for(int j=0;j<n;j++)gap[i][j]=2*Math.sqrt(radius[i]*radius[j]);
            search(0,0);System.out.printf(Locale.US,"%.3f%n",best);
        }
    }
}
