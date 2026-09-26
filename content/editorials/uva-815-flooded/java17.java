import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.StringTokenizer;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens()){String line=in.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    static String fixed(BigInteger numerator,BigInteger denominator){boolean negative=numerator.signum()<0;BigInteger rounded=numerator.abs().multiply(BigInteger.valueOf(200)).add(denominator).divide(denominator.multiply(BigInteger.TWO));if(rounded.signum()==0)negative=false;BigInteger[] parts=rounded.divideAndRemainder(BigInteger.valueOf(100));return(negative?"-":"")+parts[0]+"."+(parts[1].intValue()<10?"0":"")+parts[1];}
    public static void main(String[] args)throws Exception{String token;int region=0;while((token=word())!=null){int rows=Integer.parseInt(token),columns=Integer.parseInt(word());if(rows==0&&columns==0)break;int n=rows*columns;BigInteger[] heights=new BigInteger[n];for(int i=0;i<n;i++)heights[i]=new BigInteger(word());Arrays.sort(heights);BigInteger remaining=new BigInteger(word()),level=heights[0];int count=1;while(count<n){BigInteger volume=heights[count].subtract(level).multiply(BigInteger.valueOf(count*100));if(volume.compareTo(remaining)>0)break;remaining=remaining.subtract(volume);level=heights[count++];}BigInteger denominator=BigInteger.valueOf(count*100),numerator=level.multiply(denominator).add(remaining);int submerged=0;for(BigInteger height:heights)if(height.multiply(denominator).compareTo(numerator)<0)submerged++;System.out.println("Region "+(++region));System.out.println("Water level is "+fixed(numerator,denominator)+" meters.");System.out.println(fixed(BigInteger.valueOf(100L*submerged),BigInteger.valueOf(n))+" percent of the region is under water.");System.out.println();}}
}
