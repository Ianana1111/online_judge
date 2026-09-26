import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.StringTokenizer;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens()){String line=in.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    public static void main(String[] args)throws Exception{int m=Integer.parseInt(word()),n=Integer.parseInt(word());Map<String,BigDecimal> values=new HashMap<>();for(int i=0;i<m;i++){String name=word();values.put(name,new BigDecimal(word()));}for(int i=0;i<n;i++){BigDecimal total=BigDecimal.ZERO;String s;while((s=word())!=null&&!s.equals("."))total=total.add(values.getOrDefault(s,BigDecimal.ZERO));System.out.println(total.stripTrailingZeros().toPlainString());}}
}
