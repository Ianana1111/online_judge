import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        char[] mirror=new char[128];
        for(char ch:"AHIMOTUVWXY18".toCharArray()) mirror[ch]=ch;
        String left="EJSZ",right="3L25";
        for(int i=0;i<left.length();++i) {
            mirror[left.charAt(i)]=right.charAt(i);
            mirror[right.charAt(i)]=left.charAt(i);
        }
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNext()) {
            String word=input.next();boolean palindrome=true,mirrored=true;
            for(int i=0;i<word.length();++i) {
                char ch=word.charAt(i),other=word.charAt(word.length()-1-i);
                if(ch!=other) palindrome=false;
                if(mirror[ch]!=other) mirrored=false;
            }
            String kind=palindrome?(mirrored?"a mirrored palindrome.":"a regular palindrome.")
                                  :(mirrored?"a mirrored string.":"not a palindrome.");
            output.append(word).append(" -- is ").append(kind).append("\n\n");
        }
        System.out.print(output);
    }
}
