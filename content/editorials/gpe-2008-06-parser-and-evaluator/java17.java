import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayDeque;

public class Main {
    static int priority(char op){return op=='P'||op=='N'?4:op=='%'?3:op=='*'||op=='/'?2:1;}
    static void apply(ArrayDeque<BigInteger> values,ArrayDeque<Character> operators){char op=operators.pop();if(op=='P'||op=='N'){if(values.isEmpty())throw new IllegalArgumentException();if(op=='N')values.push(values.pop().negate());return;}if(op=='('||values.size()<2)throw new IllegalArgumentException();BigInteger b=values.pop(),a=values.pop();switch(op){case '+':values.push(a.add(b));break;case '-':values.push(a.subtract(b));break;case '*':values.push(a.multiply(b));break;case '/':values.push(a.divide(b));break;default:values.push(a.remainder(b));}}
    static String evaluate(String line){ArrayDeque<BigInteger> values=new ArrayDeque<>();ArrayDeque<Character> operators=new ArrayDeque<>();boolean expecting=true;try{int at=0;while(at<line.length()){char ch=line.charAt(at);if(Character.isWhitespace(ch)){at++;continue;}if(ch>='0'&&ch<='9'){if(!expecting)throw new IllegalArgumentException();int begin=at;while(at<line.length()&&line.charAt(at)>='0'&&line.charAt(at)<='9')at++;values.push(new BigInteger(line.substring(begin,at)));expecting=false;continue;}at++;
        if(ch=='('){if(!expecting)throw new IllegalArgumentException();operators.push(ch);}else if(ch==')'){if(expecting)throw new IllegalArgumentException();while(!operators.isEmpty()&&operators.peek()!='(')apply(values,operators);if(operators.isEmpty())throw new IllegalArgumentException();operators.pop();expecting=false;}else if(ch=='+'||ch=='-'||ch=='*'||ch=='/'||ch=='%'){if(expecting){if(ch!='+'&&ch!='-')throw new IllegalArgumentException();operators.push(ch=='+'?'P':'N');}else{while(!operators.isEmpty()&&operators.peek()!='('&&priority(operators.peek())>=priority(ch))apply(values,operators);operators.push(ch);expecting=true;}}else throw new IllegalArgumentException();}
        if(expecting)throw new IllegalArgumentException();while(!operators.isEmpty())apply(values,operators);if(values.size()!=1)throw new IllegalArgumentException();return values.pop().toString();
    }catch(IllegalArgumentException|ArithmeticException e){return "syntactically incorrect";}}
    public static void main(String[] args)throws Exception{BufferedReader in=new BufferedReader(new InputStreamReader(System.in));String line;int tc=0;while((line=in.readLine())!=null){System.out.println("case "+(++tc)+":");System.out.println(evaluate(line));System.out.println();}}
}
