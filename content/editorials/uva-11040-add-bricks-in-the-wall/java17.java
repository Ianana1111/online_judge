import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(input.readLine());return tokens.nextToken();}
    public static void main(String[]args)throws Exception{
        int tests=Integer.parseInt(next());
        while(tests-->0){
            BigInteger[][]wall=new BigInteger[9][9];
            for(int r=0;r<9;r+=2)for(int c=0;c<=r;c+=2)wall[r][c]=new BigInteger(next());
            for(int r=6;r>=0;r-=2)for(int c=0;c<=r;c+=2){
                BigInteger left=wall[r+2][c],right=wall[r+2][c+2];
                BigInteger middle=wall[r][c].subtract(left).subtract(right).divide(BigInteger.TWO);
                wall[r+2][c+1]=middle;wall[r+1][c]=left.add(middle);wall[r+1][c+1]=middle.add(right);
            }
            for(int r=0;r<9;r++){StringBuilder line=new StringBuilder();for(int c=0;c<=r;c++){if(c>0)line.append(' ');line.append(wall[r][c]);}System.out.println(line);}
        }
    }
}
