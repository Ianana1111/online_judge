import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    static boolean[][]adjacent;static int[]owner;static boolean[]seen;
    static boolean augment(int gopher){
        for(int hole=0;hole<owner.length;hole++)if(adjacent[gopher][hole]&&!seen[hole]){
            seen[hole]=true;if(owner[hole]<0||augment(owner[hole])){owner[hole]=gopher;return true;}
        }
        return false;
    }
    public static void main(String[]args)throws Exception{
        String token;
        while((token=next())!=null){
            int n=Integer.parseInt(token),holes=Integer.parseInt(next()),seconds=Integer.parseInt(next()),speed=Integer.parseInt(next());
            BigDecimal[][]points=new BigDecimal[n+holes][2];for(BigDecimal[]point:points){point[0]=new BigDecimal(next());point[1]=new BigDecimal(next());}
            BigDecimal limit=BigDecimal.valueOf(seconds*speed).pow(2);adjacent=new boolean[n][holes];
            for(int i=0;i<n;i++)for(int j=0;j<holes;j++){
                BigDecimal dx=points[i][0].subtract(points[n+j][0]),dy=points[i][1].subtract(points[n+j][1]);
                adjacent[i][j]=dx.multiply(dx).add(dy.multiply(dy)).compareTo(limit)<=0;
            }
            owner=new int[holes];Arrays.fill(owner,-1);int saved=0;
            for(int i=0;i<n;i++){seen=new boolean[holes];if(augment(i))saved++;}
            System.out.println(n-saved);
        }
    }
}
