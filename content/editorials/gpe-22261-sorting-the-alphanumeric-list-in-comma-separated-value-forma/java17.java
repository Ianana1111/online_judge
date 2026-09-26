import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
public class Main {
    static String trimSpaces(String value){int first=0,last=value.length();while(first<last&&value.charAt(first)==' ')first++;while(last>first&&value.charAt(last-1)==' ')last--;return value.substring(first,last);}
    static class Record{
        String original;String[]key;Record(String line){original=line;key=line.split(",",-1);for(int i=0;i<key.length;i++)key[i]=trimSpaces(key[i]);}
    }
    static int compare(Record a,Record b){
        for(int i=0;i<Math.min(a.key.length,b.key.length);i++){int order=a.key[i].compareTo(b.key[i]);if(order!=0)return order;}
        return Integer.compare(a.key.length,b.key.length);
    }
    public static void main(String[]args)throws Exception{
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));int tests=Integer.parseInt(input.readLine().trim());StringBuilder output=new StringBuilder();
        for(int test=0;test<tests;test++){
            ArrayList<Record>rows=new ArrayList<>();String line;do{line=input.readLine();}while(line!=null&&line.isEmpty());
            while(line!=null&&!line.isEmpty()){rows.add(new Record(line));line=input.readLine();}
            rows.sort(Main::compare);if(test>0)output.append('\n');for(Record row:rows)output.append(row.original).append('\n');
        }
        System.out.print(output);
    }
}
