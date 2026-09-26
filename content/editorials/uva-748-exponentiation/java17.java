import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.StringTokenizer;
public class Main {
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;
        while((line=input.readLine())!=null){
            StringTokenizer tokens=new StringTokenizer(line);if(!tokens.hasMoreTokens())continue;
            BigDecimal value=new BigDecimal(tokens.nextToken());int exponent=Integer.parseInt(tokens.nextToken());
            String result=value.pow(exponent).stripTrailingZeros().toPlainString();
            if(result.startsWith("0."))result=result.substring(1);System.out.println(result);
        }
    }
}
