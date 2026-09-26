import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    public static void main(String[]args)throws Exception{
        String expression;
        while((expression=next())!=null){
            int count=Integer.parseInt(next()),at=0;ArrayList<BigInteger>constants=new ArrayList<>();ArrayList<Character>operators=new ArrayList<>();BigInteger[]result=new BigInteger[count];
            while(true){
                int first=++at;if(expression.charAt(at)=='-')at++;
                while(expression.charAt(at)>='0'&&expression.charAt(at)<='9')at++;
                BigInteger value=new BigInteger(expression.substring(first,at));
                if(expression.charAt(at)==']'){java.util.Arrays.fill(result,value);break;}
                constants.add(value);operators.add(expression.charAt(at++));
            }
            for(int frame=constants.size()-1;frame>=0;frame--){
                BigInteger[]updated=new BigInteger[count];BigInteger value=constants.get(frame);
                if(operators.get(frame)=='+'){
                    updated[0]=value;for(int i=1;i<count;i++)updated[i]=updated[i-1].add(result[i-1]);
                }else{
                    updated[0]=value.multiply(result[0]);for(int i=1;i<count;i++)updated[i]=updated[i-1].multiply(result[i]);
                }
                result=updated;
            }
            StringBuilder answer=new StringBuilder();for(int i=0;i<count;i++){if(i!=0)answer.append(' ');answer.append(result[i]);}System.out.println(answer);
        }
    }
}
