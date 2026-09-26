import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayList;
public class Main {
    static void collapse(ArrayList<BigInteger>values,ArrayList<Character>operators,int i,BigInteger result){values.set(i,result);values.remove(i+1);operators.remove(i);}
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;
        while((line=input.readLine())!=null){
            ArrayList<BigInteger>values=new ArrayList<>();ArrayList<Character>operators=new ArrayList<>();int at=0;
            while(at<line.length()){
                char ch=line.charAt(at);if(ch<=' '){at++;continue;}
                if(ch>='0'&&ch<='9'){
                    int first=at;while(at<line.length()&&line.charAt(at)>='0'&&line.charAt(at)<='9')at++;
                    values.add(new BigInteger(line.substring(first,at)));
                }else{at++;if(ch=='*'&&at<line.length()&&line.charAt(at)=='*'){ch='^';at++;}operators.add(ch);}
            }
            if(values.isEmpty())continue;
            for(int i=operators.size()-1;i>=0;i--)if(operators.get(i)=='^'){
                BigInteger base=values.get(i),result=base.equals(BigInteger.ONE)?BigInteger.ONE:base.pow(values.get(i+1).intValueExact());collapse(values,operators,i,result);
            }
            for(int i=0;i<operators.size();)if(operators.get(i)=='*')collapse(values,operators,i,values.get(i).multiply(values.get(i+1)));else i++;
            BigInteger answer=values.get(0);
            for(int i=0;i<operators.size();i++)answer=operators.get(i)=='+'?answer.add(values.get(i+1)):answer.subtract(values.get(i+1));
            System.out.println(answer);
        }
    }
}
