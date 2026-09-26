import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    public static void main(String[]args)throws Exception{
        String token;
        while((token=next())!=null){
            int n=Integer.parseInt(token),nights=Integer.parseInt(next());BigInteger[]distance=new BigInteger[n+1];BigInteger low=BigInteger.ZERO,high=BigInteger.ZERO;
            for(int i=0;i<=n;i++){distance[i]=new BigInteger(next());low=low.max(distance[i]);high=high.add(distance[i]);}
            while(low.compareTo(high)<0){
                BigInteger middle=low.add(high).shiftRight(1),walked=BigInteger.ZERO;int days=1;
                for(BigInteger segment:distance){
                    if(walked.add(segment).compareTo(middle)>0){days++;walked=segment;}else walked=walked.add(segment);
                    if(days>nights+1)break;
                }
                if(days<=nights+1)high=middle;else low=middle.add(BigInteger.ONE);
            }
            System.out.println(low);
        }
    }
}
