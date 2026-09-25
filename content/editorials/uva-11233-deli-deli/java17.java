import java.util.HashMap;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);
        int irregularCount=input.nextInt(),queries=input.nextInt();
        HashMap<String,String> irregular=new HashMap<>();
        for(int i=0;i<irregularCount;++i) irregular.put(input.next(),input.next());
        StringBuilder output=new StringBuilder();
        while(queries-->0) {
            String word=input.next(),answer=irregular.get(word);
            if(answer==null) {
                int length=word.length();
                if(length>=2 && word.charAt(length-1)=='y' && "aeiou".indexOf(word.charAt(length-2))<0)
                    answer=word.substring(0,length-1)+"ies";
                else if(word.endsWith("o")||word.endsWith("s")||word.endsWith("ch")||word.endsWith("sh")||word.endsWith("x"))
                    answer=word+"es";
                else answer=word+"s";
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
