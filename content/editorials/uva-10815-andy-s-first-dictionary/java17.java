import java.io.BufferedInputStream;
import java.util.TreeSet;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedInputStream input=new BufferedInputStream(System.in);TreeSet<String> words=new TreeSet<>();
        StringBuilder word=new StringBuilder();int ch;
        while((ch=input.read())!=-1) {
            if(ch>='A' && ch<='Z') ch=ch-'A'+'a';
            if(ch>='a' && ch<='z') word.append((char)ch);
            else if(word.length()>0) {words.add(word.toString());word.setLength(0);}
        }
        if(word.length()>0) words.add(word.toString());
        StringBuilder output=new StringBuilder();
        for(String entry:words) output.append(entry).append('\n');
        System.out.print(output);
    }
}
