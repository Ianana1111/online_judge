import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();int tc=0;
        while(input.hasNext()) {
            String sequence=input.next();if(sequence.equals("end")) break;
            char[] tops=new char[sequence.length()];int size=0;
            for(int i=0;i<sequence.length();++i) {
                char container=sequence.charAt(i);int left=0,right=size;
                while(left<right) {
                    int middle=(left+right)/2;
                    if(tops[middle]<container) left=middle+1;
                    else right=middle;
                }
                if(left==size) ++size;
                tops[left]=container;
            }
            output.append("Case ").append(++tc).append(": ").append(size).append('\n');
        }
        System.out.print(output);
    }
}
