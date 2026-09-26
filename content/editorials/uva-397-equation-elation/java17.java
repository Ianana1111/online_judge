import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayList;
public class Main {
    static String render(ArrayList<BigInteger>values,ArrayList<Character>operators,String variable){
        StringBuilder result=new StringBuilder(values.get(0).toString());for(int i=0;i<operators.size();i++)result.append(' ').append(operators.get(i)).append(' ').append(values.get(i+1));return result.append(" = ").append(variable).toString();
    }
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;boolean first=true;
        while((line=input.readLine())!=null){
            if(line.trim().isEmpty())continue;int equal=line.indexOf('=');String expression=line.substring(0,equal),variable=line.substring(equal+1).trim();ArrayList<BigInteger>values=new ArrayList<>();ArrayList<Character>operators=new ArrayList<>();int at=0;
            while(true){
                while(at<expression.length()&&Character.isWhitespace(expression.charAt(at)))at++;boolean negative=false;
                if(expression.charAt(at)=='-'||expression.charAt(at)=='+'){negative=expression.charAt(at)=='-';at++;while(Character.isWhitespace(expression.charAt(at)))at++;}
                int begin=at;while(at<expression.length()&&expression.charAt(at)>='0'&&expression.charAt(at)<='9')at++;
                BigInteger value=new BigInteger(expression.substring(begin,at));values.add(negative?value.negate():value);
                while(at<expression.length()&&Character.isWhitespace(expression.charAt(at)))at++;if(at==expression.length())break;operators.add(expression.charAt(at++));
            }
            if(!first)System.out.println();first=false;System.out.println(render(values,operators,variable));
            while(!operators.isEmpty()){
                int index=0;for(int i=0;i<operators.size();i++)if(operators.get(i)=='*'||operators.get(i)=='/'){index=i;break;}
                BigInteger a=values.get(index),b=values.get(index+1),result;char op=operators.get(index);
                if(op=='+')result=a.add(b);else if(op=='-')result=a.subtract(b);else if(op=='*')result=a.multiply(b);else result=a.divide(b);
                values.set(index,result);values.remove(index+1);operators.remove(index);System.out.println(render(values,operators,variable));
            }
        }
    }
}
